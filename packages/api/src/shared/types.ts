import { Request, Response } from 'express';
import * as core from 'express-serve-static-core';
import { Send } from 'express-serve-static-core';

export type Query = core.Query;
export type Params = core.ParamsDictionary;

export interface QueryInput {
  sortColumn?: string;
  sortType?: string;
  limit?: string;
  page?: string;
}

export interface QueryInputParsedQs extends QueryInput, Query {}

export interface SearchQueryInput extends QueryInput {
  search?: string;
}

export interface SearchQueryInputParsedQs extends SearchQueryInput, Query {}

export interface EventLogsQueryInput extends QueryInput {
  search?: string;
  type?: string;
}

export interface EventLogsQueryInputParsedQs
  extends EventLogsQueryInput,
    Query {}

export interface TypedRequest<T extends Query, U> extends Request {
  body: U;
  query: T;
}

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
