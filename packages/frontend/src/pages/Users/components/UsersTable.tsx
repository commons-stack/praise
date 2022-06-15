import {
  AllAdminUsers,
  AllForwarderUsers,
  AllQuantifierUsers,
  AllUsers,
} from '@/model/users';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { UserDto, UserRole } from 'api/dist/user/types';
import UsersTableRow from './UsersTableRow';
import UsersTablePagination from './UsersTablePagination';
import SearchInput from '@/components/form/SearchInput';
import SelectInput from '@/components/form/SelectInput';

interface roleOptionsProps {
  value: string;
  label: string;
}

const roleOptions = [
  { label: 'All users', value: UserRole.USER },
  { label: 'Admins', value: UserRole.ADMIN },
  { label: 'Forwarders', value: UserRole.FORWARDER },
  { label: 'Quantifiers', value: UserRole.QUANTIFIER },
];

const USERS_PER_PAGE = 10;

const UsersTable = (): JSX.Element => {
  const allAdminUsers = useRecoilValue(AllAdminUsers);
  const allForwarderUsers = useRecoilValue(AllForwarderUsers);
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const allUsers = useRecoilValue(AllUsers);
  const [tableData, setTableData] = React.useState<UserDto[]>();
  const [selectedRole, setSelectedRole] = React.useState<roleOptionsProps>(
    roleOptions[0]
  );
  const [filter, setFilter] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(1);
  const [lastPage, setLastPage] = React.useState<number>(0);

  const applyFilter = React.useCallback(
    (data: UserDto[] | undefined): UserDto[] => {
      if (!data) return [];
      const filteredData = data.filter((user: UserDto) => {
        const userAddress = user.ethereumAddress?.toLowerCase();
        const filterData = filter.toLocaleLowerCase();

        return (
          user.nameRealized.toLowerCase().includes(filterData) ||
          userAddress?.includes(filterData)
        );
      });

      return filteredData;
    },

    [filter]
  );

  React.useEffect(() => {
    if (allUsers) {
      setTableData(allUsers);
    }
  }, [allUsers]);

  React.useEffect(() => {
    switch (selectedRole.value) {
      case UserRole.USER:
        setTableData(allUsers);
        break;
      case UserRole.ADMIN:
        setTableData(allAdminUsers);
        break;
      case UserRole.FORWARDER:
        setTableData(allForwarderUsers);
        break;
      case UserRole.QUANTIFIER:
        setTableData(allQuantifierUsers);
        break;
    }
    setFilter('');
  }, [
    selectedRole,
    allUsers,
    allAdminUsers,
    allForwarderUsers,
    allQuantifierUsers,
  ]);

  React.useEffect(() => {
    if (tableData) {
      setPage(1);
      const filteredData = applyFilter(tableData);

      if (filteredData.length % USERS_PER_PAGE === 0) {
        setLastPage(Math.trunc(filteredData.length / USERS_PER_PAGE));
      } else {
        setLastPage(Math.trunc(filteredData.length / USERS_PER_PAGE) + 1);
      }
    }
  }, [tableData, filter, applyFilter]);

  return (
    <>
      <div className="flex flex-col gap-4 mx-5 sm:flex-row">
        <SelectInput
          handleChange={setSelectedRole}
          selected={selectedRole}
          options={roleOptions}
        />
        <SearchInput handleChange={setFilter} value={filter} />
      </div>

      <div className="flex justify-between px-4 my-4">
        <div className="w-1/2">
          <span className="font-bold">User</span>
        </div>
        <div className="w-1/2">
          <span className="font-bold">Roles</span>
        </div>
      </div>
      <React.Suspense fallback="Loading...">
        {applyFilter(tableData).map((row, index) => {
          if (Math.trunc(index / USERS_PER_PAGE) + 1 === page) {
            return <UsersTableRow key={row._id} data={row} />;
          }
        })}
        <UsersTablePagination
          lastPage={lastPage}
          page={page}
          setPage={setPage}
        />
      </React.Suspense>
    </>
  );
};

export default UsersTable;
