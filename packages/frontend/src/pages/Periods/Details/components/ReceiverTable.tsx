import Notice from '@/components/Notice';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { PeriodPageParams, SinglePeriod } from '@/model/periods';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useSortBy, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import { sortBy } from 'lodash';

const ReceiverTable = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const period = useRecoilValue(SinglePeriod(periodId));

  const ReceiverTableInner = (): JSX.Element => {
    const history = useHistory();

    const columns = React.useMemo(
      () => [
        {
          Header: 'Receiver',
          accessor: '_id',
          className: 'text-left',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Cell: (data: any): JSX.Element => (
            <div>{data.row.original.userAccount.name}</div>
          ),
        },
        {
          Header: 'Praise Count',
          className: 'text-center',
          accessor: 'praiseCount',
        },
        {
          Header: 'Total Score',
          className: 'text-center',
          accessor: 'scoreRealized',
          sortType: 'basic',
        },
      ],
      []
    );
    const data = period?.receivers
      ? sortBy(period.receivers, [
          // First, sort by reciever score
          (receiver): number => {
            if (!receiver?.scoreRealized) return 0;
            return receiver.scoreRealized;
          },

          // Then by receiver _id
          (receiver): string => receiver._id.toString(),
        ])
      : [];

    const options = {
      columns,
      data: data,
      initialState: {
        sortBy: [
          {
            id: period?.status === 'OPEN' ? 'praiseCount' : 'praiseScore',
            desc: true,
          },
        ],
      },
    } as TableOptions<{}>;
    const tableInstance = useTable(options, useSortBy);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      tableInstance;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (data: any) => (): void => {
      history.push(`/periods/${periodId}/receiver/${data._id}`);
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
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // eslint-disable-next-line react/jsx-key
                <th
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  className={(column as any).className}
                  {...column.getHeaderProps()}
                >
                  {column.render('Header')}
                </th>
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
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-500"
                {...row.getRowProps()}
                onClick={handleClick(row.original)}
              >
                {row.cells.map((cell) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <td
                      {...cell.getCellProps()}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      className={(cell.column as any).className}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  if (!period) return <div>Period not found.</div>;

  if (period.status === 'QUANTIFY' && !isAdmin)
    return (
      <div className="flex items-center w-full h-full">
        <Notice type="danger">
          <span>Praise scores are not visible during quantification.</span>
        </Notice>
      </div>
    );

  if (period?.receivers?.length === 0)
    return (
      <div className="flex items-center w-full h-full">
        <Notice type="danger">
          <span>No receivers found in this period.</span>
        </Notice>
      </div>
    );

  if (period.receivers) return <ReceiverTableInner />;

  return null;
};

export default ReceiverTable;
