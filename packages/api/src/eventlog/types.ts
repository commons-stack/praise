import { UserAccountDto } from '../useraccount/types';
import { Document, Types } from 'mongoose';

export enum EventLogTypeKey {
  PERMISSION = 'PERMISSION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERIOD = 'PERIOD',
  PRAISE = 'PRAISE',
  QUANTIFICATION = 'QUANTIFICATION',
  SETTING = 'SETTING',
}

export interface EventLog {
  user?: Types.ObjectId;
  useraccount?: Types.ObjectId;
  period?: Types.ObjectId;
  type: Types.ObjectId;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLogDocument extends EventLog, Document {}

export interface EventLogDto {
  user?: string;
  useraccount?: UserAccountDto;
  type: EventLogTypeDto;
  description: string;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventLogType {
  key: string;
  label: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLogTypeDocument extends EventLogType, Document {}

export interface EventLogTypeDto {
  key: string;
  label: string;
  description: string;
}

export interface EventLogInput {
  type?: Types.ObjectId[];
  description?: Object;
}
