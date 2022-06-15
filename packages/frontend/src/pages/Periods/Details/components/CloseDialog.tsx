import {
  faCalendarAlt,
  faTimes,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';

interface PeriodCloseDialogProps {
  onClose(): void;
  onRemove(): void;
}
const PeriodCloseDialog = ({
  onClose,
  onRemove,
}: PeriodCloseDialogProps): JSX.Element => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-gray-800 opacity-30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faCalendarAlt} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">Close period</Dialog.Title>
          <Dialog.Description className="text-center mb-7">
            Closing a period means no more quantifications can be performed. A
            closed period cannot be re-opened.
          </Dialog.Description>
          <div className="flex justify-center">
            <button
              className="mt-4 bg-red-600 praise-button"
              onClick={(): void => {
                onRemove();
                onClose();
              }}
            >
              <FontAwesomeIcon
                className="mr-2"
                icon={faTimesCircle}
                size="1x"
              />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodCloseDialog;
