import {
  faTimes,
  faArrowRightArrowLeft,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import differenceBy from 'lodash/differenceBy';
import { ScrollableDialog } from '@/components/ScrollableDialog';
import { IconButton } from '@/components/IconButton';
import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';
import { SelectUserRadioGroup } from '@/components/user/SelectUserRadioGroup';
import { Notice } from '@/components/Notice';
import { AllQuantifierUsers } from '@/model/users';

interface Props {
  onClose(): void;
  onConfirm(newQuantifierId: string): void;
  open: boolean;
  selectedUserId: string | undefined;
}

export const ReplaceQuantifierDialog = ({
  onClose,
  onConfirm,
  open = false,
  selectedUserId,
}: Props): JSX.Element | null => {
  const [replacementUserId, setReplacementUserId] = useState<
    string | undefined
  >(undefined);
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const possibleReplacementUsers = differenceBy(
    allQuantifierUsers,
    [{ _id: selectedUserId }],
    (u) => u._id
  );

  if (!selectedUserId) return null;
  if (!allQuantifierUsers) return null;

  const resetAndClose = (): void => {
    setReplacementUserId(undefined);
    onClose();
  };

  return (
    <ScrollableDialog open={open} onClose={resetAndClose}>
      <div className="w-full h-full">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={resetAndClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20 space-y-6">
          <div className="flex justify-center">
            <FontAwesomeIcon icon={faArrowRightArrowLeft} size="2x" />
          </div>
          <h2 className="text-center">Replace Quantifier</h2>
          <div className="text-center">
            <UserAvatarAndName
              userId={selectedUserId}
              avatarClassName="text-2xl"
            />
          </div>
          <div className="px-12 text-center">
            <FontAwesomeIcon
              icon={faWarning}
              size="1x"
              className="text-yellow-500"
            />{' '}
            Please note that any quantifications already made by this user will
            be deleted.
          </div>

          {allQuantifierUsers.length === 0 ? (
            <Notice type="danger">
              <span>
                There are no unassigned quantifiers available. Please add
                additional quantifiers before replacing this one.
              </span>
            </Notice>
          ) : (
            <>
              <div>
                <SelectUserRadioGroup
                  users={possibleReplacementUsers}
                  value={replacementUserId}
                  onSelect={setReplacementUserId}
                />
              </div>
              <div className="flex justify-center">
                <IconButton
                  icon={faArrowRightArrowLeft}
                  disabled={replacementUserId === undefined}
                  text="Replace"
                  onClick={(): void => {
                    if (!replacementUserId) return;

                    onConfirm(replacementUserId);
                    resetAndClose();
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </ScrollableDialog>
  );
};
