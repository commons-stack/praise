import { makeApiAuthClient } from '@/utils/api';
import { EventLogDto, EventLogTypeDto } from 'api/dist/eventlog/types';
import { PaginatedResponseBody } from 'api/dist/shared/types';
import { useEffect, useState } from 'react';

export type AllEventLogsQueryParameters = {
  sortColumn: string;
  sortType: string;
  limit: number;
  page: number;
  type: string;
  search: string;
};

export const useAllEventLogs = (
  queryParameters: AllEventLogsQueryParameters
): {
  data: PaginatedResponseBody<EventLogDto>;
  loading: boolean;
} => {
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<PaginatedResponseBody<EventLogDto>>({
    docs: [],
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);

      const apiAuthClient = makeApiAuthClient();
      const response = await apiAuthClient.get('/eventlogs/all', {
        params: queryParameters,
      });

      setLogs(response.data);
      setLoading(false);
    };

    void fetchData();
  }, [setLogs, setLoading, queryParameters]);

  return { data: logs, loading };
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
