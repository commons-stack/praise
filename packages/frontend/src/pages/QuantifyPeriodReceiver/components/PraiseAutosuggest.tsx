import { UserPseudonym } from '@/components/user/UserPseudonym';
import { ActiveUserId } from '@/model/auth';
import {
  PeriodAndReceiverPageParams,
  PeriodQuantifierReceiverPraise,
} from '@/model/periods';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';
import { classNames } from '@/utils/index';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import { useCombobox } from 'downshift';
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

interface PraiseAutosuggestProps {
  onClose(): void;
  onSelect(id: string): void;
  praise: PraiseDto;
}

const PraiseAutosuggest = ({
  onSelect,
  onClose,
  praise,
}: PraiseAutosuggestProps): JSX.Element | null => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const userId = useRecoilValue(ActiveUserId);
  const data = useRecoilValue(
    PeriodQuantifierReceiverPraise({ periodId, receiverId })
  );

  const usePseudonyms = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS'
  ) as boolean;

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  if (!data) return null;

  const filteredData = data.filter(
    (p) =>
      p &&
      p.quantifications.findIndex((quant) => quant.quantifier === userId) >=
        0 &&
      p.receiver._id === receiverId &&
      p._id !== praise._id
  );

  const DropdownCombobox = (): JSX.Element => {
    const [inputItems, setInputItems] = React.useState(filteredData);
    const {
      isOpen,
      getMenuProps,
      getInputProps,
      getComboboxProps,
      highlightedIndex,
      getItemProps,
    } = useCombobox({
      items: inputItems,
      onInputValueChange: ({ inputValue }) => {
        const search = inputValue
          ? inputValue.toLocaleLowerCase().replace('#', '').trim()
          : '';
        if (filteredData) {
          setInputItems(
            filteredData.filter((praise) => {
              if (praise && `#${praise._id.slice(-4)}`.includes(search))
                return true;
              return false;
            })
          );
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSelectedItemChange: (data: any): void => {
        if (!data) return;
        const selectedItem = data.selectedItem as PraiseDto;
        onSelect(selectedItem._id);
        onClose();
      },
    });
    return (
      <div>
        <div {...getComboboxProps()}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                <FontAwesomeIcon icon={faPrayingHands} />
              </span>
            </div>
            <input
              className="pl-10 text-sm w-80"
              type="text"
              placeholder="Search by praise id"
              {...getInputProps({ ref: inputRef })}
            />
          </div>
        </div>
        <ul
          className={classNames(
            isOpen && inputItems.length > 0 ? '' : 'hidden',
            'absolute bg-white border w-80 mt-[1px]'
          )}
          {...getMenuProps()}
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <li
                className={classNames(
                  highlightedIndex === index ? 'bg-gray-100' : '',
                  'py-2 pl-2 cursor-pointer'
                )}
                key={item._id} //TODO fix key
                {...getItemProps({ item, index })}
              >
                #{item && item._id.slice(-4)} -{' '}
                {item &&
                  (usePseudonyms ? (
                    <UserPseudonym
                      userId={item.giver._id}
                      periodId={periodId}
                    />
                  ) : (
                    item.giver.name
                  ))}
              </li>
            ))}
        </ul>
      </div>
    );
  };
  return <DropdownCombobox />;
};

export default PraiseAutosuggest;
