import BreadCrumb from '@/components/BreadCrumb';
import {
  faArrowDownWideShort,
  faBook,
} from '@fortawesome/free-solid-svg-icons';
import { Suspense, useEffect, useMemo, useState } from 'react';
import EventLogsList from './components/EventLogsList';
import LoaderSpinner from '@/components/LoaderSpinner';
import MultiselectInput from '@/components/form/MultiselectInput';
import SearchInput from '@/components/form/SearchInput';
import SelectInput from '@/components/form/SelectInput';
import {
  AllEventLogsQueryParameters,
  useAllEventLogTypes,
} from '@/model/eventlogs';
import { debounce } from '@mui/material';

const sortOptions = [
  { value: 'desc', label: 'Newest' },
  { value: 'asc', label: 'Oldest' },
];

interface filterOptionsProps {
  key: string;
  label: string;
}

interface sortOptionsProps {
  value: string;
  label: string;
}

const defaultQueryParameters = {
  sortColumn: 'createdAt',
  sortType: 'desc',
  limit: 15,
  page: 1,
  type: '',
  search: '',
} as AllEventLogsQueryParameters;

const EventLogsPage = (): JSX.Element => {
  const [selectedFilters, setSelectedFilters] = useState<filterOptionsProps[]>(
    []
  );
  const [selectedSort, setSelectedSort] = useState<sortOptionsProps>(
    sortOptions[0]
  );
  const [searchValue, setSearchValue] = useState<string>('');

  const [page, setPage] = useState<number>(1);

  const { types } = useAllEventLogTypes();
  const filterOptions = types.docs;

  const [queryParameters, setQueryParameters] = useState(
    defaultQueryParameters
  );

  const setLocalParameters = useMemo(
    () =>
      debounce((data) => {
        const params = {
          ...defaultQueryParameters,
          ...{ sortType: data.selectedSort.value },
          ...{
            type: Array.prototype.map
              .call(data.selectedFilters, (s) => s.key)
              .toString(),
          },
          ...{
            search: data.searchValue,
          },
          ...{ page: data.page },
        };

        setQueryParameters(params);
      }, 600),
    []
  );

  useEffect(() => {
    setLocalParameters({
      selectedFilters: selectedFilters,
      selectedSort: selectedSort,
      searchValue: searchValue,
      page: page,
    });
  }, [selectedFilters, selectedSort, searchValue, page, setLocalParameters]);

  return (
    <div className="praise-page">
      <BreadCrumb name="Transparency Log" icon={faBook} />

      <div className="w-full overflow-x-auto praise-box">
        <h2 className="mb-2">Transparency Log</h2>
        <p>A log of all user actions that change the database state.</p>
      </div>

      <div className="praise-box">
        <div className="flex mb-8">
          {/* Filter */}
          <div>
            <MultiselectInput
              handleChange={(e): void => {
                setSelectedFilters(e);
                setPage(1);
              }}
              selected={selectedFilters}
              options={filterOptions}
              noSelectedMessage="All log items"
            />
          </div>

          {/* Search */}
          <div className="ml-4">
            <SearchInput
              handleChange={(e): void => {
                setSearchValue(e);
                setPage(1);
              }}
              value={searchValue}
            />
          </div>

          {/* Sort */}
          <div className="ml-auto">
            <SelectInput
              handleChange={(e): void => {
                setSelectedSort(e);
                setPage(1);
              }}
              selected={selectedSort}
              options={sortOptions}
              icon={faArrowDownWideShort}
            />
          </div>
        </div>

        <Suspense fallback={<LoaderSpinner />}>
          <EventLogsList queryParameters={queryParameters} setPage={setPage} />
        </Suspense>
      </div>
    </div>
  );
};

export default EventLogsPage;
