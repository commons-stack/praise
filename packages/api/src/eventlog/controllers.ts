import { getQuerySort } from '@shared/functions';
import {
  EventLogsQueryInputParsedQs,
  PaginatedResponseBody,
  QueryInputParsedQs,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { BadRequestError } from '@error/errors';
import { StatusCodes } from 'http-status-codes';
import { EventLogModel, EventLogTypeModel } from './entities';
import { EventLogDto, EventLogInput, EventLogTypeDto } from './types';
import {
  eventLogListTransformer,
  eventLogTypeListTransformer,
} from './transformers';
import mongoose from 'mongoose';

/**
 * Fetch a paginated list of EventLogs
 */
export const all = async (
  req: TypedRequestQuery<EventLogsQueryInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<EventLogDto>>
): Promise<void> => {
  if (!req.query.limit || !req.query.page)
    throw new BadRequestError('limit and page are required');

  const query: EventLogInput = {};
  if (req.query.type) {
    const typesArray = req.query.type.split(',');
    const types = await EventLogTypeModel.find({ key: { $in: typesArray } });
    query.type = types.map((item) => new mongoose.Types.ObjectId(item.id));
  }

  if (req.query.search && req.query.search !== '') {
    query.description = {
      $regex: `${req.query.search.toString()}`,
      $options: 'i',
    };
  }

  const paginateQuery = {
    query,
    limit: parseInt(req.query.limit),
    page: parseInt(req.query.page),
    sort: getQuerySort(req.query),
  };

  const response = await EventLogModel.paginate(paginateQuery);

  if (!response) throw new BadRequestError('Failed to query event logs');

  const docs = response.docs ? response.docs : [];
  const docsTransfomed = await eventLogListTransformer(
    docs,
    res.locals.currentUser.roles
  );

  res.status(StatusCodes.OK).json({
    ...response,
    docs: docsTransfomed,
  });
};

/**
 * Fetch a list of EventLogsTypes
 */
export const types = async (
  req: TypedRequestQuery<QueryInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<EventLogTypeDto>>
): Promise<void> => {
  const response = await EventLogTypeModel.find();

  if (!response) throw new BadRequestError('Failed to query event log types');

  const docsTransfomed = await eventLogTypeListTransformer(response);

  res.status(StatusCodes.OK).json({
    ...response,
    docs: docsTransfomed,
  });
};
