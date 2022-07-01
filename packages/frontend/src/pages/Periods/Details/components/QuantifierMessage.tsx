import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { getQuantifierData } from '@/utils/periods';
import { PeriodPageParams, SinglePeriod } from '@/model/periods';
import { ActiveUserId } from '@/model/auth';

export const QuantifierMessage = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const history = useHistory();
  const period = useRecoilValue(SinglePeriod(periodId));
  const userId = useRecoilValue(ActiveUserId);
  const quantifierData = getQuantifierData(period, userId);

  if (!quantifierData) return null;

  return (
    <div className="mb-5 praise-box-wide">
      <div>
        <div>
          <strong>You are a quantifier for this period!</strong>
          <br />
          Assigned number of praise items: {quantifierData.praiseCount}
          <br />
          Items left to quantify:{' '}
          {quantifierData.praiseCount - quantifierData.finishedCount}
          <button
            className="block mt-5 praise-button"
            onClick={(): void => {
              history.push(`/periods/${periodId}/quantify`);
            }}
          >
            <FontAwesomeIcon icon={faCalculator} size="1x" className="mr-2" />
            Quantify
          </button>
        </div>
      </div>
    </div>
  );
};
