import flatten from 'lodash/flatten';
import { StatusCodes } from 'http-status-codes';
import { Request } from 'express';
import { BadRequestError, NotFoundError } from '@/error/errors';
import { UserModel } from '@/user/entities';
import { settingValue } from '@/shared/settings';
import { TypedRequestBody, TypedResponse } from '@/shared/types';
import { UserRole } from '@/user/types';
import { PraiseModel } from '@/praise/entities';
import { EventLogTypeKey } from '@/eventlog/types';
import { logEvent } from '@/eventlog/utils';
import { praiseListTransformer } from '@/praise/transformers';
import {
  PeriodDetailsDto,
  PeriodStatusType,
  VerifyQuantifierPoolSizeResponse,
  PeriodReplaceQuantifierDto,
  ReplaceQuantifierRequestBody,
} from '../types';
import {
  findPeriodDetailsDto,
  isAnyPraiseAssigned,
  getPeriodDateRangeQuery,
} from '../utils/core';
import { assignQuantifiersDryRun } from '../utils/assignment';
import { PeriodModel } from '../entities';

/**
 * Description
 * @param
 */
export const verifyQuantifierPoolSize = async (
  req: Request,
  res: TypedResponse<VerifyQuantifierPoolSizeResponse>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const PRAISE_QUANTIFIERS_ASSIGN_EVENLY = (await settingValue(
    'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
    period._id
  )) as boolean;

  const quantifierPoolSize = await UserModel.count({
    roles: UserRole.QUANTIFIER,
  });

  let response;

  if (PRAISE_QUANTIFIERS_ASSIGN_EVENLY) {
    response = {
      quantifierPoolSize,
      quantifierPoolSizeNeeded: quantifierPoolSize,
      quantifierPoolDeficitSize: 0,
    };
  } else {
    const assignments = await assignQuantifiersDryRun(req.params.periodId);

    response = {
      quantifierPoolSize,
      quantifierPoolSizeNeeded: assignments.poolAssignments.length,
      quantifierPoolDeficitSize: assignments.remainingAssignmentsCount,
    };
  }

  res.status(StatusCodes.OK).json(response);
};

/**
 * Description
 * @param
 */
export const assignQuantifiers = async (
  req: Request,
  res: TypedResponse<PeriodDetailsDto>
): Promise<void> => {
  const { periodId } = req.params;
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');
  if (period.status !== 'OPEN')
    throw new BadRequestError(
      'Quantifiers can only be assigned on OPEN periods.'
    );

  const anyPraiseAssigned = await isAnyPraiseAssigned(period);
  if (anyPraiseAssigned)
    throw new BadRequestError(
      'Some praise has already been assigned for this period'
    );

  const assignedQuantifiers = await assignQuantifiersDryRun(
    req.params.periodId
  );

  if (assignedQuantifiers.remainingAssignmentsCount > 0)
    throw new BadRequestError(
      `Failed to assign ${assignedQuantifiers.remainingAssignmentsCount} collection of praise to a quantifier`
    );

  let successfulAssignment = false;
  for (let i = 0; i < 3; i++) {
    if (successfulAssignment) break;

    try {
      // Generate list of db queries to apply changes specified by assignedQuantifiers
      const bulkQueries = flatten(
        assignedQuantifiers.poolAssignments.map((q) =>
          q.receivers.map((receiver) => ({
            updateMany: {
              filter: { _id: { $in: receiver.praiseIds } },
              update: {
                $push: {
                  quantifications: {
                    quantifier: q._id,
                  },
                },
              },
            },
          }))
        )
      );

      // 2022-06-30
      // Ignoring this TS error that new quantification object does not meet expected type
      //  It may be related to running $push within an updateMany within a bulkWrite *for a sub-document type*
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await PraiseModel.bulkWrite(bulkQueries);
      successfulAssignment = true;
    } catch (e) {
      await logEvent(
        EventLogTypeKey.PERIOD,
        `Faioed to assign random quantifiers to all praise in period "${period.name}", retrying...`,
        {
          userId: res.locals.currentUser._id,
        }
      );
    }
  }

  await PeriodModel.updateOne(
    { _id: period._id },
    { $set: { status: PeriodStatusType.QUANTIFY } }
  );

  await logEvent(
    EventLogTypeKey.PERIOD,
    `Assigned random quantifiers to all praise in period "${period.name}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  const periodDetailsDto = await findPeriodDetailsDto(periodId);
  res.status(StatusCodes.OK).json(periodDetailsDto);
};

export const replaceQuantifier = async (
  req: TypedRequestBody<ReplaceQuantifierRequestBody>,
  res: TypedResponse<PeriodReplaceQuantifierDto>
): Promise<void> => {
  const { periodId } = req.params;
  const { currentQuantifierId, newQuantifierId } = req.body;
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');
  if (period.status !== 'QUANTIFY')
    throw new BadRequestError(
      'Quantifiers can only be replaced on periods with status QUANTIFY.'
    );

  if (!currentQuantifierId || !newQuantifierId)
    throw new BadRequestError(
      'Both originalQuantifierId and newQuantifierId must be specified'
    );

  if (currentQuantifierId === newQuantifierId)
    throw new BadRequestError('Cannot replace a quantifier with themselves');

  const currentQuantifier = await UserModel.findById(currentQuantifierId);
  if (!currentQuantifier)
    throw new BadRequestError('Current quantifier does not exist');

  const newQuantifier = await UserModel.findById(newQuantifierId);
  if (!newQuantifier)
    throw new BadRequestError('Replacement quantifier does not exist');

  if (!newQuantifier.roles.includes(UserRole.QUANTIFIER))
    throw new BadRequestError(
      'Replacement quantifier does not have role QUANTIFIER'
    );

  const dateRangeQuery = await getPeriodDateRangeQuery(period);

  const praiseAlreadyAssignedToNewQuantifier = await PraiseModel.find({
    // Praise within time period
    createdAt: dateRangeQuery,

    // Both original and new quantifiers assigned
    $and: [
      { 'quantifications.quantifier': currentQuantifierId },
      { 'quantifications.quantifier': newQuantifierId },
    ],
  });

  if (praiseAlreadyAssignedToNewQuantifier?.length > 0)
    throw new BadRequestError(
      "Replacement quantifier is already assigned to some of the original quantifier's praise"
    );

  const affectedPraiseIds = await PraiseModel.find({
    // Praise within time period
    createdAt: dateRangeQuery,

    // Original quantifier
    'quantifications.quantifier': currentQuantifierId,
  }).distinct('_id');

  await PraiseModel.updateMany(
    {
      // Praise within time period
      createdAt: dateRangeQuery,

      // Original quantifier
      'quantifications.quantifier': currentQuantifierId,
    },
    {
      $set: {
        // Reset score
        'quantifications.$[elem].score': 0,
        'quantifications.$[elem].dismissed': false,

        // Assign new quantifier
        'quantifications.$[elem].quantifier': newQuantifierId,
      },
      $unset: {
        'quantifications.$[elem].duplicatePraise': 1,
      },
    },
    {
      arrayFilters: [
        {
          'elem.quantifier': currentQuantifierId,
        },
      ],
    }
  );

  await logEvent(
    EventLogTypeKey.PERIOD,
    `Reassigned all praise in period "${period.name}" that is currently assigned to user with id "${currentQuantifierId}", to user with id "${newQuantifierId}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  const updatedPraises = await PraiseModel.find({
    _id: { $in: affectedPraiseIds },
  }).populate('giver receiver forwarder');

  const affectedPraises = await praiseListTransformer(updatedPraises);
  const periodDetailsDto = await findPeriodDetailsDto(periodId);

  res.status(StatusCodes.OK).json({
    period: periodDetailsDto,
    praises: affectedPraises,
  });
};
