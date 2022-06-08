import BreadCrumb from '@/components/BreadCrumb';
import {
  PeriodPageParams,
  PeriodQuantifierReceivers,
  SinglePeriod,
} from '@/model/periods';
import { useAllPeriodSettingsQuery } from '@/model/periodsettings';
import BackLink from '@/navigation/BackLink';
import { getQuantificationStats } from '@/utils/periods';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import QuantifyPeriodTable from './components/QuantifyPeriodTable';

const PeriodMessage = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  useAllPeriodSettingsQuery(periodId);
  const quantificationStats = getQuantificationStats(
    useRecoilValue(PeriodQuantifierReceivers(periodId))
  );

  return (
    <>
      <h2>{period?.name}</h2>
      {quantificationStats ? (
        <div>
          Assigned number of praise items: {quantificationStats.count}
          <br />
          Items left to quantify:{' '}
          {quantificationStats.count - quantificationStats.done}
        </div>
      ) : null}
    </>
  );
};

const QuantifyPeriodPage = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();

  return (
    <div className="praise-page">
      <BreadCrumb name="Quantify" icon={faCalendarAlt} />
      <BackLink to={`/periods/${periodId}`} />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <QuantifyPeriodTable />
        </React.Suspense>
      </div>
    </div>
  );
};

export default QuantifyPeriodPage;
