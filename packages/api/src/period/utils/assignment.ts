import { firstFit, PackingOutput } from 'bin-packer';
import logger from 'jet-logger';
import flatten from 'lodash/flatten';
import intersection from 'lodash/intersection';
import range from 'lodash/range';
import sum from 'lodash/sum';
import zip from 'lodash/zip';
import greedyPartitioning from 'greedy-number-partitioning';
import { InternalServerError, NotFoundError } from '@/error/errors';
import { Quantifier, QuantifierPoolById, Receiver } from '@/praise/types';
import { UserModel } from '@/user/entities';
import { settingValue } from '@/shared/settings';
import { UserRole } from '@/user/types';
import { UserAccountDocument } from '@/useraccount/types';
import { PraiseModel } from '@/praise/entities';
import { PeriodDocument, Assignments } from '@/period/types';
import { getPreviousPeriodEndDate } from '../utils/core';
import { PeriodModel } from '../entities';

/**
 * Get all receivers with praise data
 *
 * @param  {PeriodDocument} period
 * @returns Promise
 */
const queryReceiversWithPraise = async (
  period: PeriodDocument
): Promise<Receiver[]> => {
  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  return PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
      },
    },
    {
      $group: {
        _id: '$receiver',
        praiseCount: { $count: {} },
        praiseIds: {
          $push: '$_id',
        },
      },
    },

    // Sort decsending as first step of "First Fit Decreasing" bin-packing algorithm
    {
      $sort: {
        praiseCount: -1,
      },
    },
  ]);
};

/**
 * Get all quantifiers in random order
 *
 * @returns
 */
const queryQuantifierPoolRandomized = async (): Promise<Quantifier[]> => {
  let quantifierPool = await UserModel.aggregate([
    { $match: { roles: UserRole.QUANTIFIER } },
    {
      $lookup: {
        from: 'useraccounts',
        localField: '_id',
        foreignField: 'user',
        as: 'accounts',
      },
    },
    {
      $addFields: {
        receivers: [],
      },
    },
  ]);
  quantifierPool = quantifierPool
    .sort(() => 0.5 - Math.random())
    .slice(0, quantifierPool.length);

  return quantifierPool;
};

/**
 * Assign quantifiers to bins of receivers
 *
 * @param assignmentBins
 * @param quantifierPool
 * @returns
 */
const generateAssignments = (
  assignmentBins: Receiver[][],
  quantifierPool: Quantifier[]
): Assignments => {
  // Convert array of quantifiers to a single object, keyed by _id
  const quantifierPoolById = quantifierPool.reduce<QuantifierPoolById>(
    (poolById, q) => {
      poolById[q._id] = q;
      return poolById;
    },
    {}
  );

  // Assign each quantifier to an available bin
  //  or Assign each bin to an available quantifier
  const availableQuantifiers = [...quantifierPool];
  const availableBins = [...assignmentBins];

  const skippedAssignmentBins: Receiver[][] = [];
  const skippedAssignmentOptionIds: string[] = [];

  while (availableBins.length > 0) {
    const assignmentBin: Receiver[] | undefined = availableBins.pop();
    if (!assignmentBin) continue;

    if (availableQuantifiers.length === 0) {
      skippedAssignmentBins.push(assignmentBin);
      continue;
    }

    const q = availableQuantifiers.pop();

    if (!q) throw Error('Failed to generate assignments');

    // Generate a unique id to reference this assignment option (bin + quantifier)
    const assignmentBinId: string = flatten(
      assignmentBin.map((r: Receiver) => r.praiseIds)
    ).join('+');
    const assignmentOptionId = `${q._id.toString()}-${assignmentBinId}`;

    const qUserAccountIds: string[] = q.accounts.map(
      (account: UserAccountDocument) => account._id.toString()
    );
    const assignmentReceiverIds: string[] = assignmentBin.map((r: Receiver) =>
      r._id.toString()
    );

    // Confirm none of the Receivers in the assignment bin belong to the Quantifier
    const overlappingUserAccounts = intersection(
      qUserAccountIds,
      assignmentReceiverIds
    );
    if (overlappingUserAccounts.length === 0) {
      // assign Quantifier to original pool
      quantifierPoolById[q._id.toString()].receivers.push(...assignmentBin);
    } else if (skippedAssignmentOptionIds.includes(assignmentOptionId)) {
      // this assignment option has been skipped before
      //  mark it as un-assignable by the current quantiifer set
      skippedAssignmentBins.push(assignmentBin);
    } else {
      // this assignment option has not been skipped yet
      // make quantifier available again, at end of the line
      availableQuantifiers.unshift(q);

      // make bin available again, at the beginning of the line
      availableBins.push(assignmentBin);

      // note that this assignment option has been skipped once
      skippedAssignmentOptionIds.push(assignmentOptionId);
    }
  }

  // Convert object of quantifiers back to array & remove any unassigned
  const poolAssignments: Quantifier[] = Object.values<Quantifier>(
    quantifierPoolById
  ).filter((q: Quantifier): boolean => q.receivers.length > 0);

  const remainingPraiseCount = sum(
    flatten(
      skippedAssignmentBins.map((bin) =>
        bin.map((receiver) => receiver.praiseIds.length)
      )
    )
  );

  return {
    poolAssignments,
    remainingAssignmentsCount: skippedAssignmentBins.length,
    remainingPraiseCount,
  };
};

/**
 * Verify & log that all praise is accounted for in this model
 *
 * @param period
 * @param PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER
 * @param assignments
 */
const verifyAssignments = async (
  period: PeriodDocument,
  PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER: number,
  assignments: Assignments
): Promise<void> => {
  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const totalPraiseCount: number = await PraiseModel.count({
    createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
  });
  const expectedAccountedPraiseCount: number =
    totalPraiseCount * PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER;

  const assignedPraiseCount = sum(
    flatten(
      assignments.poolAssignments.map((q: Quantifier) =>
        q.receivers.map((r: Receiver) => r.praiseIds.length)
      )
    )
  );

  const accountedPraiseCount =
    assignedPraiseCount + assignments.remainingPraiseCount;

  if (accountedPraiseCount === expectedAccountedPraiseCount) {
    logger.info(
      `All redundant praise assignments accounted for: ${accountedPraiseCount} / ${expectedAccountedPraiseCount} expected in period`
    );
  } else {
    throw new InternalServerError(
      `Not all redundant praise assignments accounted for: ${accountedPraiseCount} / ${expectedAccountedPraiseCount} expected in period`
    );
  }
};

/**
 * Apply a bin-packing algorithm to
 *  fit differently-sized collections of praise (i.e. all praise given to a single receiver)
 *  into a variable number of "bins" (i.e. quantifiers),
 *  targeting a specified number of praise assigned to each quantifiers
 *
 *  See https://en.wikipedia.org/wiki/Bin_packing_problem
 *
 * @param period
 * @param PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER
 * @param targetBinSize
 * @returns
 */
const prepareAssignmentsByTargetPraiseCount = async (
  period: PeriodDocument,
  PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER: number,
  targetBinSize: number
): Promise<Assignments> => {
  // Query a list of receivers with their collection of praise
  const receivers: Receiver[] = await queryReceiversWithPraise(period);

  // Query the list of quantifiers & randomize order
  const quantifierPool = await queryQuantifierPoolRandomized();

  // Clone the list of recievers for each redundant assignment
  //  (as defined by setting PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER)
  const redundantAssignmentBins: Receiver[][] = flatten(
    range(PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER).map(() => {
      // Run "first Fit" randomized bin-packing algorithm on list of receivers
      //    with a maximum 'bin' size of: PRAISE_PER_QUANTIFIER
      //    where each item takes up bin space based on its' praiseCount
      const receiversShuffled = receivers
        .sort(() => 0.5 - Math.random())
        .slice(0, receivers.length);

      const result: PackingOutput<Receiver> = firstFit(
        receiversShuffled,
        (r: Receiver) => r.praiseCount,
        targetBinSize
      );

      const bins: Receiver[][] = [
        ...result.bins,
        ...result.oversized.map((r) => [r]),
      ];

      return bins;
    })
  );

  const assignments = generateAssignments(
    redundantAssignmentBins,
    quantifierPool
  );

  await verifyAssignments(
    period,
    PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER,
    assignments
  );

  return assignments;
};

/**
 * Apply a multiway number partitioning algorithm to
 *  evenly distribute differently-sized collections of praise (i.e. all praise given to a single receiver)
 *  into a fixed number of "bins" (i.e. quantifiers)
 *
 *  See https://en.wikipedia.org/wiki/Multiway_number_partitioning
 *
 * @param period
 * @param PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER
 * @param TOLERANCE
 * @returns
 */
const prepareAssignmentsEvenly = async (
  period: PeriodDocument,
  PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER: number
): Promise<Assignments> => {
  // Query a list of receivers with their collection of praise
  const receivers: Receiver[] = await queryReceiversWithPraise(period);

  // Query the list of quantifiers & randomize order
  const quantifierPool = await queryQuantifierPoolRandomized();

  // Clone the list of recievers for each redundant assignment
  //  (as defined by setting PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER)
  //  zip them together, rotated, to prevent identical redundant receivers in a single bin
  if (PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER > quantifierPool.length)
    throw new Error(
      'Unable to assign redudant quantifications without more members in quantifier pool'
    );

  const redundantReceiversShuffled: Receiver[][] = zip(
    ...range(PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER).map((i) => {
      // Create a "rotated" copy of array for each redundant quantification
      //   i.e. [a, b, c, d] => [b, c, d, a]
      //  ensure each rotation does not overlap
      const receiversShuffledClone = [...receivers];

      range(i).forEach(() => {
        const lastElem = receiversShuffledClone.pop();
        if (!lastElem)
          throw Error(
            'Failed to generate list of redundant shuffled receivers'
          );

        receiversShuffledClone.unshift(lastElem);
      });

      return receiversShuffledClone;
    })
  ) as Receiver[][];

  // Run "Greedy number partitioning" algorithm on list of receivers
  //    with a fixed 'bin' size of: quantifierPool.length
  //    where each item takes up bin space based on its praiseCount
  const redundantAssignmentBins: Receiver[][][] = greedyPartitioning<
    Receiver[]
  >(
    redundantReceiversShuffled,
    quantifierPool.length,
    (receivers: Receiver[]) => sum(receivers.map((r) => r.praiseCount))
  );

  const redundantAssignmentBinsFlattened: Receiver[][] =
    redundantAssignmentBins.map((binOfBins) => flatten(binOfBins));

  const assignments = generateAssignments(
    redundantAssignmentBinsFlattened,
    quantifierPool
  );

  await verifyAssignments(
    period,
    PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER,
    assignments
  );

  return assignments;
};

export const assignQuantifiersDryRun = async (
  periodId: string
): Promise<Assignments> => {
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');

  const PRAISE_QUANTIFIERS_ASSIGN_EVENLY = (await settingValue(
    'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
    period._id
  )) as boolean;

  const PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER = (await settingValue(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    period._id
  )) as number;

  if (PRAISE_QUANTIFIERS_ASSIGN_EVENLY) {
    return prepareAssignmentsEvenly(
      period,
      PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER
    );
  } else {
    const PRAISE_PER_QUANTIFIER = (await settingValue(
      'PRAISE_PER_QUANTIFIER',
      period._id
    )) as number;

    const targetBinSize = Math.ceil(PRAISE_PER_QUANTIFIER * 1.2);

    return prepareAssignmentsByTargetPraiseCount(
      period,
      PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER,
      targetBinSize
    );
  }
};
