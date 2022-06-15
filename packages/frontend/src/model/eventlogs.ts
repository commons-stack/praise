import { useAuthApiQuery } from '@/model/api';
import { makeApiAuthClient } from '@/utils/api';
import { EventLogDto, EventLogTypeDto } from 'api/dist/eventlog/types';
import { PaginatedResponseBody } from 'api/dist/shared/types';
import { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { selectorFamily } from 'recoil';

export type AllEventLogsQueryParameters = {
  sortColumn: string;
  sortType: string;
  limit: number;
  page: number;
  type: string;
  search: string;
};

/**
 * Query selector that fetches all praise periods from the API.
 */
export const AllEventLogsQuery = selectorFamily({
  key: 'AllEventLogsQuery',
  get:
    (queryParams: AllEventLogsQueryParameters) =>
    async ({ get }): Promise<AxiosResponse<unknown>> => {
      const apiAuthClient = makeApiAuthClient();
      const response = await apiAuthClient.get('/eventlogs/all', {
        params: queryParams,
      });

      return response;
    },
});

export const useAllEventLogs = (
  queryParameters: AllEventLogsQueryParameters
): {
  logsData: PaginatedResponseBody<EventLogDto>;
  loading: boolean;
} => {
  const allEventLogsQueryResponse = useAuthApiQuery(
    AllEventLogsQuery(queryParameters)
  );

  const paginatedResponse =
    allEventLogsQueryResponse.data as PaginatedResponseBody<EventLogDto>;

  return { logsData: paginatedResponse, loading: false };
};

export const useAllEventLogTypes = (): {
  types: PaginatedResponseBody<EventLogTypeDto>;
  loading: boolean;
} => {
  const [loading, setLoading] = useState<boolean>(false);
  const [types, setTypes] = useState<PaginatedResponseBody<EventLogTypeDto>>({
    docs: [],
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);

      const apiAuthClient = makeApiAuthClient();
      const response = await apiAuthClient.get('/eventlogs/types');

      setTypes(response.data);
      setLoading(false);
    };

    void fetchData();
  }, [setTypes, setLoading]);

  return { types, loading };
};
