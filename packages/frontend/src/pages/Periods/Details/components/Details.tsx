import { HasRole, ROLE_ADMIN } from '@/model/auth';
import {
  AllPeriods,
  PeriodPageParams,
  PeriodPoolRequirements,
  SinglePeriod,
  useAssignQuantifiers,
  useClosePeriod,
  useExportPraise,
  useVerifyQuantifierPoolSize,
} from '@/model/periods';
import { AllQuantifierUsers } from '@/model/users';
import { formatIsoDateUTC } from '@/utils/date';
import { saveLocalFile } from '@/utils/file';
import { getPreviousPeriod } from '@/utils/periods';
import {
  faDownload,
  faTimesCircle,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React from 'react';
import { toast } from 'react-hot-toast';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PeriodAssignDialog from './AssignDialog';
import PeriodCloseDialog from './CloseDialog';
import PeriodDateForm from './PeriodDateForm';

const PeriodDetails = (): JSX.Element | null => {
  const [isCloseDialogOpen, setIsCloseDialogOpen] = React.useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

  const allPeriods = useRecoilValue(AllPeriods);
  const allQuantifiers = useRecoilValue(AllQuantifierUsers);
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const { exportPraise } = useExportPraise();
  const history = useHistory();

  const assignDialogRef = React.useRef(null);
  const closeDialogRef = React.useRef(null);

  const { closePeriod } = useClosePeriod();
  const { assignQuantifiers } = useAssignQuantifiers(periodId);

  const poolRequirements = useRecoilValue(PeriodPoolRequirements(periodId));
  useVerifyQuantifierPoolSize(periodId);

  if (!period || !allPeriods) return null;

  const previousPeriod = getPreviousPeriod(allPeriods, period);

  const handleClosePeriod = (): void => {
    void closePeriod(periodId);
  };

  const handleAssign = (): void => {
    const promise = assignQuantifiers();
    void toast.promise(
      promise,
      {
        loading: 'Assigning quantifiers …',
        success: 'Quantifiers assigned',
        error: 'Assign failed',
      },
      {
        position: 'top-center',
        loading: {
          duration: Infinity,
        },
      }
    );
    promise.finally(() => setTimeout(() => history.go(0), 1000));
  };

  const handleExport = (): void => {
    const toastId = 'exportToast';
    void toast.promise(
      exportPraise(period),
      {
        loading: 'Exporting …',
        success: (exportData: Blob | undefined) => {
          if (exportData) {
            saveLocalFile(exportData, 'quantification-export.csv');
            setTimeout(() => toast.remove(toastId), 2000);
            return 'Export done';
          }
          return 'Empty export returned';
        },
        error: 'Export failed',
      },
      {
        id: toastId,
        position: 'top-center',
        loading: {
          duration: Infinity,
        },
      }
    );
  };

  if (!period) return <div>Period not found.</div>;

  return (
    <div>
      <div>
        Period start:{' '}
        {previousPeriod
          ? formatIsoDateUTC(previousPeriod.endDate)
          : 'Dawn of time'}
      </div>
      {!isAdmin ? (
        <div>Period end: {formatIsoDateUTC(period.endDate)}</div>
      ) : (
        <>
          <PeriodDateForm />
          <div className="mt-5">
            {period.status === 'OPEN' || period.status === 'QUANTIFY' ? (
              <div className="flex gap-4 justify-between">
                {period.status === 'OPEN' &&
                period.receivers &&
                period?.receivers.length > 0 &&
                allQuantifiers &&
                allQuantifiers.length > 0 ? (
                  <button
                    className="praise-button"
                    onClick={(): void => {
                      setIsAssignDialogOpen(true);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUsers}
                      size="1x"
                      className="mr-2"
                    />
                    Assign quantifiers
                  </button>
                ) : null}
                {period.status === 'QUANTIFY' ? (
                  <button className="praise-button" onClick={handleExport}>
                    <FontAwesomeIcon
                      icon={faDownload}
                      size="1x"
                      className="mr-2"
                    />
                    Export
                  </button>
                ) : null}
                <button
                  className="hover:bg-red-600 praise-button"
                  onClick={(): void => setIsCloseDialogOpen(true)}
                >
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    size="1x"
                    className="mr-2"
                  />
                  Close period
                </button>
              </div>
            ) : null}
            {period.status === 'CLOSED' ? (
              <button className="praise-button" onClick={handleExport}>
                <FontAwesomeIcon icon={faDownload} size="1x" className="mr-2" />
                Export
              </button>
            ) : null}
          </div>
        </>
      )}

      <Dialog
        open={isCloseDialogOpen}
        onClose={(): void => setIsCloseDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={closeDialogRef}
      >
        <div ref={closeDialogRef}>
          <PeriodCloseDialog
            onClose={(): void => setIsCloseDialogOpen(false)}
            onRemove={(): void => handleClosePeriod()}
          />
        </div>
      </Dialog>

      {period.status === 'OPEN' && isAdmin ? (
        <Dialog
          open={isAssignDialogOpen}
          onClose={(): void => setIsAssignDialogOpen(false)}
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={assignDialogRef}
        >
          <div ref={assignDialogRef}>
            <PeriodAssignDialog
              onClose={(): void => setIsAssignDialogOpen(false)}
              onAssign={(): void => handleAssign()}
              poolRequirements={poolRequirements}
            />
          </div>
        </Dialog>
      ) : null}
    </div>
  );
};

export default PeriodDetails;
