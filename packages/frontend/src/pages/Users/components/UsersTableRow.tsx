import { shortenEthAddress } from 'api/dist/user/utils';
import { useHistory } from 'react-router-dom';
import { UserDto, UserRole } from 'api/dist/user/types';
import { InlineLabel } from '@/components/InlineLabel';
import { UserAvatar } from '@/components/user/UserAvatar';

interface IUsersTableRow {
  data: UserDto;
}

const UsersTableRow = ({ data }: IUsersTableRow): JSX.Element | null => {
  const history = useHistory();

  if (!data.ethereumAddress) return null;

  const shortEthAddress = shortenEthAddress(data.ethereumAddress);

  return (
    <div
      className="flex items-center w-full px-8 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-500"
      onClick={(): void => history.push(`users/${data._id}`)}
    >
      <div className="flex items-center w-full ">
        <div className="flex items-center w-1/2 pr-3">
          <div className="pr-3">
            <UserAvatar user={data} />
          </div>
          <div className="pr-3">
            <div>
              {shortEthAddress !== data.nameRealized ? data.nameRealized : '-'}
            </div>
            <div className="font-mono text-sm ">{shortEthAddress}</div>
          </div>
        </div>
        <div className="w-1/2">
          {data.roles.map((role, index) => {
            if (role !== UserRole.USER) {
              return <InlineLabel key={`${role}-${index}`} text={role} />;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default UsersTableRow;
