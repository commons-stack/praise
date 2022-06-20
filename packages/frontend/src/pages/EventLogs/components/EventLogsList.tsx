import {
  AllEventLogsQueryParameters,
  useAllEventLogs,
} from '@/model/eventlogs';
import EventLog from '@/components/eventlog/EventLog';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dispatch, SetStateAction } from 'react';

interface EventLogsTableProps {
  queryParameters: AllEventLogsQueryParameters;
  setPage: Dispatch<SetStateAction<number>>;
}

const EventLogsTable = ({
  queryParameters,
  setPage,
}: EventLogsTableProps): JSX.Element | null => {
  const { data } = useAllEventLogs(queryParameters);

  return (
    <div className="w-full">
      <div className="w-full space-y-4">
        {data.docs.map((eventlog, i) => (
          <EventLog
            eventlog={eventlog}
            className={`${i % 2 === 0 && 'bg-gray-100 dark:bg-slate-500'} px-7`}
            key={i}
          />
        ))}
      </div>
      {(data.hasNextPage || data.hasPrevPage) && (
        <div className="w-full flex justify-between space-x-4 mt-4">
          <div>
            {data.hasPrevPage && (
              <a
                className="cursor-pointer"
                onClick={(): void => setPage(queryParameters.page - 1)}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  size="1x"
                  className="pl-5 mr-2"
                />
                Previous
              </a>
            )}
          </div>

          <div>
            {data.hasNextPage && (
              <a
                className="cursor-pointer"
                // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                onClick={(): void => setPage(queryParameters.page + 1)}
              >
                Next
                <FontAwesomeIcon
                  icon={faArrowRight}
                  size="1x"
                  className="pr-5 ml-2"
                />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventLogsTable;
