import { UserDto } from 'api/dist/user/types';
import LoaderSpinner from '@/components/LoaderSpinner';
import { AllPraiseList } from '@/model/praise';
import { faSadTear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TableOptions, useTable } from 'react-table';
import { useRecoilValue } from 'recoil';
import { ActiveUserId } from '@/model/auth';
import { SingleUser } from '@/model/users';
import Praise from '@/components/praise/Praise';
import PraisePageLoader from '../../Start/components/PraisePageLoader';
import PraiseRow from '@/components/praise/PraiseRow';

export const MY_PRAISE_LIST_KEY = 'MY_PRAISE';

//TODO add support for more than one user account connected to one user
const getReceiverId = (user: UserDto | undefined): string | undefined => {
  const accounts = user?.accounts;
  return Array.isArray(accounts) && accounts.length > 0
    ? accounts[0]._id
    : undefined;
};

const MyPraiseTable = (): JSX.Element => {
  const allPraise = useRecoilValue(AllPraiseList(MY_PRAISE_LIST_KEY));
  const userId = useRecoilValue(ActiveUserId);
  const user = useRecoilValue(SingleUser(userId));
  const [receiverId, setReceiverId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    setReceiverId(getReceiverId(user));
  }, [user]);

  const columns = React.useMemo(
    () => [
      {
        accessor: 'createdAt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Cell: (data: any) => (
          <Praise praise={data.row.original} showReceiver={true} />
        ),
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
      {' '}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div>
          {' '}
          <FontAwesomeIcon icon={faSadTear} size="2x" className="mr-2" />
          <div className="mt-3">You have not yet received any praise.</div>
        </div>
      )}
      <React.Suspense fallback={<LoaderSpinner />}>
        {receiverId && (
          <PraisePageLoader
            listKey={MY_PRAISE_LIST_KEY}
            receiverId={receiverId}
          />
        )}
      </React.Suspense>
    </>
  );
};

export default MyPraiseTable;
