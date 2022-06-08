import LoaderSpinner from '@/components/LoaderSpinner';
import { AllPraiseList } from '@/model/praise';
import { PraiseDto } from 'api/dist/praise/types';
import React from 'react';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import { faSadTear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PraisePageLoader from './PraisePageLoader';
import Praise from '../../../components/praise/Praise';
import PraiseRow from '@/components/praise/PraiseRow';

export const ALL_PRAISE_LIST_KEY = 'ALL_PRAISE';

const PraiseTable = (): JSX.Element => {
  const allPraise = useRecoilValue(AllPraiseList(ALL_PRAISE_LIST_KEY));
  const columns = React.useMemo(
    () => [
      {
        accessor: 'createdAt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any) => <Praise praise={data.row.original} />,
      },
    ],
    []
  );

  const options = {
    columns,
    data: allPraise ? allPraise : [],
  } as TableOptions<{}>;
  const tableInstance = useTable(options);

  const { getTableProps, getTableBodyProps, rows, prepareRow } = tableInstance;

  return (
    <>
      {allPraise ? (
        <table
          id="praises-table"
          className="w-full table-fixed"
          {...getTableProps()}
        >
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                // eslint-disable-next-line react/jsx-key
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell, index) => {
                    return (
                      <PraiseRow praise={row.original as PraiseDto} key={index}>
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      </PraiseRow>
                    );
                  })}
                </tr> //TODO fix
              );
            })}
          </tbody>
        </table>
      ) : (
        <div>
          {' '}
          <FontAwesomeIcon icon={faSadTear} size="2x" className="mr-2" />
          <div className="mt-3">No praise has been dished yet.</div>
        </div>
      )}
      <React.Suspense fallback={<LoaderSpinner />}>
        <PraisePageLoader />
      </React.Suspense>
    </>
  );
};

export default PraiseTable;
