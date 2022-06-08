import LoaderSpinner from '@/components/LoaderSpinner';
import { useEffect } from 'react';
import { useSignMessage } from 'wagmi';

interface Props {
  text: string;
  message: string;
  onSignSuccess(signature: string): void;
  onSignError(): void;
}

const SignMessageButton = ({
  text,
  message,
  onSignSuccess,
  onSignError,
}: Props): JSX.Element | null => {
  const { isLoading, isSuccess, signMessage } = useSignMessage({
    message,
    onError() {
      onSignError();
    },
    onSuccess(data) {
      onSignSuccess(data);
    },
  });

  return isLoading || isSuccess ? (
    <LoaderSpinner />
  ) : (
    <button
      className="px-4 py-2 font-bold text-white bg-gray-800 rounded hover:bg-gray-700"
      onClick={(): void => signMessage()}
    >
      {text}
    </button>
  );
};

export { SignMessageButton };
