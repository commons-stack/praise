import { shortenEthAddress } from 'api/dist/user/utils';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import BreadCrumb from '@/components/BreadCrumb';
import BackLink from '@/navigation/BackLink';
import { SingleUser, SingleUserParams, useAdminUsers } from '@/model/users';
import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { formatIsoDateUTC } from '@/utils/date';
import { classNames } from '@/utils/index';
import { UserDto, UserRole } from 'api/dist/user/types';
import { toast } from 'react-hot-toast';

const roles = [UserRole.ADMIN, UserRole.FORWARDER, UserRole.QUANTIFIER];

const UserDetailsPage = (): JSX.Element | null => {
  const { userId } = useParams<SingleUserParams>();
  const user = useRecoilValue(SingleUser(userId));
  const { addRole, removeRole } = useAdminUsers();

  const handleRole = async (role: UserRole, user: UserDto): Promise<void> => {
    let resp;
    const isRemove = user.roles.includes(role);
    if (isRemove) {
      resp = await removeRole(user._id, role);
    } else {
      resp = await addRole(user._id, role);
    }
    if (resp?.status === 200) {
      toast.success(`Role ${isRemove ? 'removed' : 'added'} successfully!`);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <BreadCrumb name="User details" icon={faUserGroup} />
      <BackLink to="/users" />
      <div className="praise-box flex flex-col gap-2">
        <span>User identity</span>
        <span className="text-xl font-bold">
          {user.ethereumAddress && shortenEthAddress(user.ethereumAddress)}
        </span>
        <div>
          Created: {formatIsoDateUTC(user.createdAt)}
          <br />
          Last updated: {formatIsoDateUTC(user.updatedAt)}
        </div>
      </div>
      <div className="praise-box flex flex-col gap-2">
        <span>Linked Discord identity</span>
        {user?.accounts?.map((account) => (
          <>
            <span className="text-xl font-bold">{account.name}</span>
            <div>
              Discord User ID: {account.user}
              <br />
              Created: {formatIsoDateUTC(account.createdAt)}
              <br />
              Last updated: {formatIsoDateUTC(account.updatedAt)}
            </div>
          </>
        ))}
      </div>
      <div className="praise-box">
        <span className="text-xl font-bold">Roles</span>
        <div className="flex flex-wrap gap-4 pt-5">
          {roles.map((role) => (
            <div
              key={role}
              className={classNames(
                'flex gap-2 justify-center items-center py-2 px-3 rounded-md cursor-pointer bg-black',
                user.roles.includes(role) ? '' : 'opacity-50'
              )}
              onClick={(): void => void handleRole(role, user)}
            >
              <input
                checked={user.roles.includes(role)}
                className="text-lime-500 cursor-pointer"
                name={role}
                type="checkbox"
                readOnly
              />
              <label className="text-white cursor-pointer" htmlFor={role}>
                {role}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
