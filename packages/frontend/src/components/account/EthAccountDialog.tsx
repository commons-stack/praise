import { shortenEthAddress } from 'api/dist/user/utils/core';
import {
  faTimes,
  faCopy,
  faArrowRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useDisconnect } from 'wagmi';
import { useSetRecoilState } from 'recoil';
import { toast } from 'react-hot-toast';
import { useRef } from 'react';
import { ActiveTokenSet } from '@/model/auth';

interface EthAccountDialogProps {
  open?: boolean;
  onClose(): void;
  address: string;
}

export const EthAccountDialog = ({
  open = false,
  onClose,
  address,
}: EthAccountDialogProps): JSX.Element => {
  const { disconnect } = useDisconnect();
  const setActiveTokenSet = useSetRecoilState(ActiveTokenSet);
  const contentRef = useRef(null);

  const handleCopyAddress = async (): Promise<void> => {
    await navigator.clipboard.writeText(address);
    toast.success('Copied address');
    onClose();
  };

  const handleDisconnect = (): void => {
    disconnect();
    setActiveTokenSet(undefined);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(): void => onClose()}
      className="fixed inset-0 z-50 overflow-y-auto"
      initialFocus={contentRef}
    >
      <div className="flex items-center justify-center min-h-screen bg-black/30">
        <div className="p-10 praise-box-defaults" ref={contentRef}>
          <div className="flex justify-end">
            <button className="praise-button-round" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} size="1x" />
            </button>
          </div>
          <div>
            <div className="flex justify-center mb-8">
              <Jazzicon address={address} className="w-12 h-12" />
            </div>
            <Dialog.Title className="text-center dark:text-white">
              {shortenEthAddress(address)}
            </Dialog.Title>
            <div className="flex justify-center space-x-4">
              <button
                className="mt-4 praise-button"
                onClick={(): void => void handleCopyAddress()}
              >
                <FontAwesomeIcon className="mr-2" icon={faCopy} size="1x" />
                Copy address
              </button>
              <button className="mt-4 praise-button" onClick={handleDisconnect}>
                <FontAwesomeIcon
                  className="mr-2"
                  icon={faArrowRightFromBracket}
                  size="1x"
                />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
