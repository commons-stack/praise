import { UserPseudonym } from '@/components/user/UserPseudonym';
import {
  PeriodPageParams,
  PeriodQuantifierReceivers,
  QuantifierReceiverData,
  usePeriodQuantifierPraiseQuery,
} from '@/model/periods';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';

const DoneLabel = (): JSX.Element => {
  return (
    <div className="pl-1 pr-1 ml-2 text-xs text-white no-underline bg-green-400 py-[3px] rounded inline-block relative top-[-1px]">
      <FontAwesomeIcon icon={faCheckCircle} size="1x" className="mr-2" />
      Done
    </div>
  );
};

const QuantifyPeriodTable = (): JSX.Element => {
  const history = useHistory();
  const { periodId } = useParams<PeriodPageParams>();
  const { location } = useHistory();
  usePeriodQuantifierPraiseQuery(periodId, location.key);
  const data = useRecoilValue(PeriodQuantifierReceivers(periodId));
  const usePseudonyms = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS'
  ) as boolean;

  const columns = React.useMemo(
    () => [
      {
        Header: 'Receiver',
        accessor: 'receiverName',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element => {
          return usePseudonyms ? (
            <UserPseudonym
              userId={data.row.original.receiverId}
              periodId={data.row.original.periodId}
            />
          ) : (
            data.value
          );
        },
      },
      {
        Header: 'Remaining items',
        accessor: 'count',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): string | null => {
          const item = data.row.original;
          if (!item) return null;
          return `${item.count - item.done} / ${item.count}`;
        },
      },
      {
        Header: '',
        accessor: 'done',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any): JSX.Element | null => {
          const item = data.row.original;
          if (!item) return null;
          return item.count - item.done === 0 ? (
            <div className="w-full text-right">
              <DoneLabel />
            </div>
          ) : null;
        },
      },
    ],
    [usePseudonyms]
  );

  const options = {
    columns,
    data: data ? data : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const handleClick = (data: QuantifierReceiverData) => () => {
    history.push(
      `/periods/${data.periodId}/quantify/receiver/${data.receiverId}`
    );
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
              <th className="text-left" {...column.getHeaderProps()}>
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
              id=""
              {...row.getRowProps()}
              onClick={handleClick(row.original as QuantifierReceiverData)}
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

export default QuantifyPeriodTable;
