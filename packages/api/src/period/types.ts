import {
  Quantifier,
  QuantificationDocument,
  QuantificationDto,
  Quantification,
} from '@praise/types';
import { Query } from '@shared/types';
import { UserAccountDocument, UserAccountDto } from '@useraccount/types';
import { PeriodSettingDto } from '@periodsettings/types';
import mongoose, { Types } from 'mongoose';

export enum PeriodStatusType {
  OPEN = 'OPEN',
  QUANTIFY = 'QUANTIFY',
  CLOSED = 'CLOSED',
}

export interface Period {
  name: string;
  status: PeriodStatusType;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodDocument extends Period, mongoose.Document {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $__: any;
}

export interface PeriodDetailsReceiver {
  _id: Types.ObjectId;
  praiseCount: number;
  quantifications?: Array<Array<QuantificationDocument>>;
  scoreRealized: number;
  userAccounts: UserAccountDocument[];
}

export interface PeriodDetailsReceiverDto {
  _id: string;
  praiseCount: number;
  quantifications?: Array<Array<QuantificationDto>>;
  scoreRealized: number;
  userAccount?: UserAccountDto;
}

export interface PeriodDetailsQuantifier {
  _id: string;
  quantifications: Array<Quantification>;
  praiseCount: number;
}

export interface PeriodDetailsQuantifierDto {
  _id: string;
  finishedCount: number;
  praiseCount: number;
}

export interface PeriodDetailsDto {
  _id: string;
  name: string;
  status: PeriodStatusType;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  quantifiers?: PeriodDetailsQuantifierDto[];
  receivers?: PeriodDetailsReceiverDto[];
  settings?: PeriodSettingDto[];
}

export interface VerifyQuantifierPoolSizeResponse {
  quantifierPoolSize: number;
  quantifierPoolSizeNeeded: number;
  quantifierPoolDeficitSize: number;
}

export interface PeriodCreateInput {
  name: string;
  endDate: string;
}

export interface PeriodUpdateInput {
  _id: string;
  name?: string;
  endDate?: string;
}

export interface PeriodReceiverPraiseInput extends Query {
  receiverId?: string;
}

export interface PeriodQuantifierPraiseInput extends Query {
  quantifierId?: string;
}

export interface Assignments {
  poolAssignments: Quantifier[];
  remainingAssignmentsCount: number;
  remainingPraiseCount: number;
}

export interface PeriodDateRange {
  $gt: Date;
  $lte: Date;
}
