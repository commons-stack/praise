import {
  faCalculator,
  faCopy,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PraiseDto } from 'api/dist/praise/types';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { PeriodPageParams } from '@/model/periods';
import { Praise } from '@/components/praise/Praise';
import { ScrollableDialog } from '@/components/ScrollableDialog';
import { SinglePeriodSettingValueRealized } from '@/model/periodsettings';
import { IconButton } from '@/components/IconButton';
import { QuantifySlider } from './QuantifySlider';

interface DuplicateDialogProps {
  onClose(): void;
  onConfirm(number): void;
  open: boolean;
  originalPraise: PraiseDto | undefined;
  duplicatesCount: number;
}

export const DuplicateDialog = ({
  onClose,
  onConfirm,
  open = false,
  originalPraise,
  duplicatesCount,
}: DuplicateDialogProps): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    if (!originalPraise?.scoreRealized) return;

    setScore(originalPraise.scoreRealized);
  }, [originalPraise?.scoreRealized]);

  const allowedValues = useRecoilValue(
    SinglePeriodSettingValueRealized({
      periodId,
      key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    })
  ) as number[];

  const duplicatePraisePercentage = useRecoilValue(
    SinglePeriodSettingValueRealized({
      periodId,
      key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    })
  ) as number;

  if (!originalPraise || duplicatesCount < 2) return null;

  return (
    <ScrollableDialog open={open} onClose={onClose}>
      <div className="w-full h-full">
        <div className="flex justify-end p-6">
          <button className="praise-button-round" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </button>
        </div>
        <div className="px-20 space-y-6">
          <div className="flex justify-center">
            <FontAwesomeIcon icon={faCalculator} size="2x" />
          </div>
          <h2 className="text-center">
            Mark {duplicatesCount} praise as duplicates
          </h2>
          {duplicatePraisePercentage && (
            <p className="text-center">
              Set a score for the first praise in the series.
              <br />
              The remaining {duplicatesCount - 1} praise will be marked as
              duplicates of that one and receive{' '}
              {duplicatePraisePercentage * 100}% of its value.
            </p>
          )}
          <Praise
            praise={originalPraise}
            className="p-5 rounded-md bg-warm-gray-100"
            showScore={false}
            bigGiverAvatar={false}
            showReceiver={false}
          />
          <div className="flex justify-center">
            <QuantifySlider
              allowedScores={allowedValues}
              score={score}
              onChange={(newScore): void => setScore(newScore)}
            />
          </div>
          <div className="flex justify-center">
            <IconButton
              icon={faCopy}
              text="Mark as duplicates"
              onClick={(): void => {
                onConfirm(score);
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </ScrollableDialog>
  );
};
