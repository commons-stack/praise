import { PeriodModel } from '@period/entities';
import { PeriodStatusType } from '@period/types';
import { UserRole } from '@user/types';
import { UserAccountModel } from '@useraccount/entities';
import { userAccountTransformer } from '@useraccount/transformers';
import { EventLogTypeModel } from './entities';
import {
  EventLogDocument,
  EventLogDto,
  EventLogTypeDocument,
  EventLogTypeDto,
} from './types';

const eventLogTypeTransformer = (
  eventLogType: EventLogTypeDocument
): EventLogTypeDto => {
  const { key, label, description } = eventLogType;

  return {
    key,
    label,
    description,
  } as EventLogTypeDto;
};

export const eventLogTypeListTransformer = async (
  eventLogTypes: EventLogTypeDocument[]
): Promise<EventLogTypeDto[]> => {
  const eventLogTypeDtos = await Promise.all(
    eventLogTypes.map((eventLogType) => eventLogTypeTransformer(eventLogType))
  );

  return eventLogTypeDtos;
};

export const eventLogTransformer = async (
  eventLog: EventLogDocument,
  currentUserRoles: UserRole[] = [UserRole.USER]
): Promise<EventLogDto> => {
  const eventLogType = await EventLogTypeModel.findOne({
    _id: eventLog.type,
  }).orFail();

  const _id = eventLog._id.toString();
  const createdAt = eventLog.createdAt.toISOString();
  const updatedAt = eventLog.updatedAt.toISOString();
  const eventLogTypeDto = eventLogTypeTransformer(eventLogType);
  const user = eventLog.user ? eventLog.user : undefined;

  let useraccount = undefined;
  if (eventLog.useraccount) {
    const userAccountDocument = await UserAccountModel.findOne({
      _id: eventLog.useraccount,
    }).orFail();
    useraccount = userAccountTransformer(userAccountDocument);
  }

  // Hide eventLog contents if related to a period
  //  and period has status QUANTIFY
  //  and user is not ADMIN
  const period = eventLog.period
    ? await PeriodModel.findOne({ _id: eventLog.period }).orFail()
    : undefined;

  let hidden = false;
  let description = eventLog.description;
  if (
    period?.status === PeriodStatusType.QUANTIFY &&
    !currentUserRoles.includes(UserRole.ADMIN)
  ) {
    description = '';
    hidden = true;
  }

  return {
    _id,
    user,
    useraccount,
    type: eventLogTypeDto,
    description,
    hidden,
    createdAt,
    updatedAt,
  } as EventLogDto;
};

export const eventLogListTransformer = async (
  eventLogs: EventLogDocument[],
  currentUserRoles: UserRole[] = [UserRole.USER]
): Promise<EventLogDto[]> => {
  const eventLogDtos = await Promise.all(
    eventLogs.map((eventLog) => eventLogTransformer(eventLog, currentUserRoles))
  );

  return eventLogDtos;
};
