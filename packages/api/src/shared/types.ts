import { Request, Response } from 'express';
import * as core from 'express-serve-static-core';
import { Send } from 'express-serve-static-core';

export type Query = core.Query;

export interface QueryInput {
  sortColumn?: string;
  sortType?: string;
  limit?: string;
  page?: string;
}

export interface QueryInputParsedQs extends QueryInput, Query {}

interface EventLogsQueryInput extends QueryInput {
  search?: string;
  type?: string;
}

export interface EventLogsQueryInputParsedQs
  extends EventLogsQueryInput,
    Query {}

export interface TypedRequestQuery<T extends Query> extends Request {
  query: T;
}

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface TypedResponse<ResBody> extends Response {
  json: Send<ResBody, this>;
}

export interface PaginatedResponseBody<T> {
  totalDocs?: number;
  limit?: number;
  totalPages?: number;
  page?: number;
  pagingCounter?: number;
  hasPrevPage?: Boolean;
  hasNextPage?: Boolean;
  prevPage?: number;
  nextPage?: number;
  hasMore?: Boolean;
  docs: T[];
}
