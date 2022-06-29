import { PraiseDto } from 'api/dist/praise/types';
import getWeek from 'date-fns/getWeek';
import parseISO from 'date-fns/parseISO';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';
import { useQuantifyPraise } from '@/model/praise';
import { PeriodQuantifierReceiverPraise } from '@/model/periods';
import { QuantifyBackNextLink } from './BackNextLink';
import DismissDialog from './DismissDialog';
import DuplicateDialog from './DuplicateDialog';
import DuplicateSearchDialog from './DuplicateSearchDialog';
import MarkDuplicateButton from './MarkDuplicateButton';
import MarkDismissedButton from './MarkDismissedButton';
import QuantifyPraiseRow from './QuantifyPraiseRow';

interface Props {
  periodId: string;
  receiverId: string;
  key: string;
}

const QuantifyTable = ({ periodId, receiverId }: Props): JSX.Element | null => {
  const data = useRecoilValue(
    PeriodQuantifierReceiverPraise({ periodId, receiverId })
  );
  const usePseudonyms = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS'
  ) as boolean;
  const { quantify } = useQuantifyPraise();

  const [isDismissDialogOpen, setIsDismissDialogOpen] = React.useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] =
    React.useState(false);
  const [isDuplicateSearchDialogOpen, setIsDuplicateSearchDialogOpen] =
    React.useState(false);
  const [duplicateSearchDialogPraise, setDuplicateSearchDialogPraise] =
    React.useState<PraiseDto | undefined>(undefined);
  const [selectedPraises, setSelectedPraises] = React.useState<PraiseDto[]>([]);

  const allowedValues = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_ALLOWED_VALUES'
  ) as number[];

  if (!data) return null;

  const handleDismiss = (): void => {
    if (selectedPraises.length > 0) {
      selectedPraises.forEach((praise: PraiseDto) => {
        void quantify(praise._id, 0, true, null);
      });

      setSelectedPraises([]);
    }
  };

  const handleDuplicate = (originalScore: number): void => {
    if (selectedPraises.length >= 2) {
      const originalPraise = selectedPraises[0];
      void quantify(originalPraise._id, originalScore, false, null);

      selectedPraises.slice(1).forEach((praise: PraiseDto) => {
        void quantify(praise._id, 0, false, originalPraise._id);
      });

      setSelectedPraises([]);
    }
  };

  const handleSetScore = (praise: PraiseDto, score: number): void => {
    void quantify(praise._id, score, false, null);
  };

  const handleDuplicateSearchPraise = (originalPraiseId: string): void => {
    if (!duplicateSearchDialogPraise) return;

    void quantify(duplicateSearchDialogPraise._id, 0, false, originalPraiseId);
    setDuplicateSearchDialogPraise(undefined);
  };

  const handleToggleCheckbox = (praise: PraiseDto): void => {
    if (selectedPraises.includes(praise)) {
      const newSelectedPraiseIds = selectedPraises.filter(
        (p) => p._id !== praise._id
      );

      setSelectedPraises(newSelectedPraiseIds);
    } else {
      setSelectedPraises(
        sortBy([...selectedPraises, praise], (p) => p.createdAt)
      );
    }
  };

  const weeklyData = groupBy(
    sortBy(data, (p) => p.createdAt),
    (praise: PraiseDto) => {
      if (!praise) return 0;
      return getWeek(parseISO(praise.createdAt), { weekStartsOn: 1 });
    }
  );

  const isChecked = (praise: PraiseDto): boolean => {
    return selectedPraises.map((p) => p._id).includes(praise._id);
  };

  return (
    <div>
      <div className="sticky z-10 w-full p-5 space-x-4 border-t border-l border-r top-14 lg:top-0 rounded-t-xl bg-warm-gray-100 dark:bg-slate-700">
        <MarkDuplicateButton
          disabled={selectedPraises.length < 2}
          onClick={(): void => setIsDuplicateDialogOpen(true)}
        />
        <MarkDismissedButton
          disabled={selectedPraises.length < 1}
          onClick={(): void => setIsDismissDialogOpen(true)}
        />
      </div>

      <div className="overflow-x-auto rounded-t-none praise-box-wide">
        <table className="w-full table-auto">
          <tbody>
            {Object.keys(weeklyData).map((weekKey, index) => (
              <React.Fragment key={index}>
                {index !== 0 && index !== data.length - 1 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="mb-5 border-2 border-t border-warm-gray-400" />
                    </td>
                  </tr>
                )}

                {weeklyData[weekKey].map((praise) => (
                  <QuantifyPraiseRow
                    key={praise._id}
                    praise={praise}
                    periodId={periodId}
                    usePseudonyms={usePseudonyms}
                    allowedValues={allowedValues}
                    checked={isChecked(praise)}
                    onToggleCheck={(): void => handleToggleCheckbox(praise)}
                    onSetScore={(score): void => handleSetScore(praise, score)}
                    onDuplicateClick={(): void => {
                      setDuplicateSearchDialogPraise(praise);
                      setIsDuplicateSearchDialogOpen(true);
                    }}
                  />
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <QuantifyBackNextLink periodId={periodId} receiverId={receiverId} />
      </div>

      <DismissDialog
        open={isDismissDialogOpen}
        onClose={(): void => setIsDismissDialogOpen(false)}
        praises={selectedPraises}
        onConfirm={(): void => handleDismiss()}
      />
      <DuplicateDialog
        open={isDuplicateDialogOpen}
        originalPraise={selectedPraises[0]}
        duplicatesCount={selectedPraises.length}
        onClose={(): void => setIsDuplicateDialogOpen(false)}
        onConfirm={(originalScore): void => handleDuplicate(originalScore)}
      />
      <DuplicateSearchDialog
        open={isDuplicateSearchDialogOpen}
        selectedPraise={duplicateSearchDialogPraise}
        onClose={(): void => setIsDuplicateSearchDialogOpen(false)}
        onConfirm={(praiseId: string): void =>
          handleDuplicateSearchPraise(praiseId)
        }
      />
    </div>
  );
};

export default QuantifyTable;
