import mongoose, { Schema } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import {
  EventLogDocument,
  EventLogTypeDocument,
  EventLogTypeKey,
} from './types';

export const eventLogSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    useraccount: {
      type: Schema.Types.ObjectId,
      ref: 'UserAccount',
      index: true,
    },
    type: {
      type: Schema.Types.ObjectId,
      ref: 'EventLogType',
      required: true,
      index: true,
    },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

eventLogSchema.plugin(mongoosePagination);

export const EventLogModel = mongoose.model<
  EventLogDocument,
  Pagination<EventLogDocument>
>('EventLog', eventLogSchema);

export const eventLogTypeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: Object.values(EventLogTypeKey),
    },
    label: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const EventLogTypeModel = mongoose.model<
  EventLogTypeDocument,
  Pagination<EventLogTypeDocument>
>('EventLogType', eventLogTypeSchema);