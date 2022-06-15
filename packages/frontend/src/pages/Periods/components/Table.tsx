import { AllPeriods } from '@/model/periods';
import { formatIsoDateUTC } from '@/utils/date';
import { classNames } from '@/utils/index';
import { PeriodDetailsDto } from 'api/dist/period/types';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

const PeriodsTable = (): JSX.Element => {
  const allPeriods = useRecoilValue(AllPeriods);
  const history = useHistory();

  const columns = React.useMemo(
    () => [
      {
        Header: 'Period',
        accessor: 'name',
      },
      {
        Header: 'End date',
        accessor: 'endDate',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): string => {
          return formatIsoDateUTC(data.value);
        },
      },
      {
        Header: '',
        accessor: 'status',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => {
          return (
            <div className="w-full text-right">
              <div
                className={classNames(
                  data.value === 'OPEN'
                    ? 'bg-green-300'
                    : data.value === 'QUANTIFY'
                    ? 'bg-pink-300'
                    : 'bg-gray-300',
                  'inline-block px-2 py-1 text-xs text-white bg-gray-800 rounded-full'
                )}
              >
                {data.value === 'QUANTIFY' ? 'QUANTIFYING' : data.value}
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  const options = {
    columns,
    data: allPeriods ? allPeriods : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (!Array.isArray(allPeriods) || allPeriods.length === 0)
    return <div>Create your first period to get started quantifying.</div>;

  const handleClick = (periodId: string) => (): void => {
    history.push(`/periods/${periodId}/receivers`);
  };
  return (
    <table
      id="periods-table"
      className="w-full table-auto"
      {...getTableProps()}
    >
      <thead>
        {headerGroups.map((headerGroup) => (
          // eslint-disable-next-line react/jsx-key
          <tr className="px-5">
            {headerGroup.headers.map((column) => (
              // eslint-disable-next-line react/jsx-key
              <th className="text-left">{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            // eslint-disable-next-line react/jsx-key
            <tr
              className={classNames(
                row.values.status === 'CLOSED' ? 'text-gray-400' : '',
                'px-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-500'
              )}
              id="" //TODO set id
              {...row.getRowProps()}
              onClick={handleClick((row.original as PeriodDetailsDto)._id)}
            >
              {row.cells.map((cell) => {
                // eslint-disable-next-line react/jsx-key
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PeriodsTable;
