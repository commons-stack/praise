import { generateActivateMessage } from 'api/dist/activate/utils';
import { AccountActivated } from '@/model/activate';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import queryString from 'query-string';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useHistory, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { upperFirst, lowerCase } from 'lodash';
import { useAccount } from 'wagmi';
import { requestApiActivate } from '@/utils/auth';
import SignMessageLayout from '../../layouts/SignMessageLayout';

interface Props {
  accountId: string;
  platform: string;
  token: string;
}

const ActivateDialog = ({ accountId, platform, token }: Props): JSX.Element => {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const { data } = useAccount();

  useEffect(() => {
    const generateNewMessage = (
      accountId: string,
      address: string,
      token: string
    ): void => {
      try {
        const newMessage = generateActivateMessage(accountId, address, token);

        setMessage(newMessage);
      } catch (err) {
        toast.error('Error connecting to server');
      }
    };

    if (data?.address && accountId && token)
      void generateNewMessage(accountId, data.address, token);
  }, [data, accountId, token]);

  const onSignSuccess = async (signature): Promise<void> => {
    try {
      if (!data?.address || !message || !signature || !accountId)
        throw new Error();

      // 3. Verify signature with server
      await requestApiActivate({
        ethereumAddress: data.address,
        message,
        signature,
        accountId,
      });
    } catch (err) {
      toast.error('Activation failed');
    }
  };

  return (
    <SignMessageLayout
      onSignSuccess={(signature): void => void onSignSuccess(signature)}
      message={message}
      buttonText="Sign activation message"
    >
      <div className="flex justify-center w-full">
        <div>
          <div className="mb-2 text-xl font-semibold text-center">Activate</div>
          <div className="text-center">
            Activate your {upperFirst(lowerCase(platform))} account and link
            with an Ethereum address.{' '}
          </div>
        </div>
      </div>
    </SignMessageLayout>
  );
};

export default function ActivatePage(): JSX.Element | null {
  const { search } = useLocation();
  const { accountId, platform, token } = queryString.parse(search);
  const accountActivated = useRecoilValue(AccountActivated);
  const history = useHistory();

  // Redirect user to home if missing required activation params
  if (
    !platform ||
    !accountId ||
    !token ||
    Array.isArray(platform) ||
    Array.isArray(accountId) ||
    Array.isArray(token)
  ) {
    history.replace('/');
    return null;
  }

  return accountActivated ? (
    <div className="flex h-screen">
      <div className="m-auto text-center">
        <FontAwesomeIcon icon={faPrayingHands} size="2x" />
        <br />
        <h2 className="mt-3">
          Your {upperFirst(lowerCase(platform))} account has been activated!
        </h2>
        <div className="mt-3">You can now close this window or tab.</div>
      </div>
    </div>
  ) : (
    <ActivateDialog platform={platform} accountId={accountId} token={token} />
  );
}
