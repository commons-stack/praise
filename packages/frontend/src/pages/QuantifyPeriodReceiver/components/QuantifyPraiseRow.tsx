import { PraiseDto } from 'api/dist/praise/types';
import Notice from '@/components/Notice';
import Praise from '@/components/praise/Praise';
import { ActiveUserId } from '@/model/auth';
import {
  findPraiseQuantification,
  shortenDuplicatePraiseId,
} from '@/utils/praise';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRecoilValue } from 'recoil';
import QuantifySlider from './QuantifySlider';

interface Props {
  praise: PraiseDto;
  periodId: string;
  usePseudonyms: boolean;
  allowedValues: number[];
  checked?: boolean;
  onToggleCheck();
  onSetScore(newScore: number);
  onDuplicateClick();
}

const QuantifyPraiseRow = ({
  praise,
  periodId,
  usePseudonyms,
  allowedValues,
  checked = false,
  onToggleCheck,
  onSetScore,
  onDuplicateClick,
}: Props): JSX.Element | null => {
  const userId = useRecoilValue(ActiveUserId);
  if (!userId) return null;

  const quantification = findPraiseQuantification(praise, userId);
  if (!quantification) return null;

  const dismissed = quantification.dismissed;
  const duplicate = !!quantification.duplicatePraise;

  return (
    <tr className="group">
      <td>
        <input
          type="checkbox"
          className="mr-4 text-xl w-5 h-5"
          checked={checked}
          onChange={onToggleCheck}
        />
      </td>
      <td>
        <Praise
          praise={praise}
          showIdPrefix={true}
          showReceiver={false}
          periodId={periodId}
          usePseudonyms={usePseudonyms}
          dismissed={dismissed}
          shortDuplicatePraiseId={shortenDuplicatePraiseId(praise, userId)}
        />
      </td>
      <td>
        {duplicate ? (
          <Notice type="info" className="w-40 py-2">
            <>
              Duplicate score: <br />
              {quantification.scoreRealized}
            </>
          </Notice>
        ) : (
          <QuantifySlider
            allowedScores={allowedValues}
            score={quantification.scoreRealized}
            disabled={dismissed || duplicate}
            onChange={onSetScore}
          />
        )}
      </td>
      <td>
        <div className="w-3">
          <button
            className="hidden group-hover:block text-gray-400 hover:text-gray-500 cursor-pointer"
            disabled={duplicate}
            onClick={onDuplicateClick}
          >
            <FontAwesomeIcon icon={faCopy} size="1x" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default QuantifyPraiseRow;
