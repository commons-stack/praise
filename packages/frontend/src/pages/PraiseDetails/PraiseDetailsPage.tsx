import BreadCrumb from '@/components/BreadCrumb';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import { SinglePeriodByDate } from '@/model/periods';
import { PraisePageParams, useSinglePraiseQuery } from '@/model/praise';
import BackLink from '@/navigation/BackLink';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PraiseDetailTable from './components/PraiseDetailTable';

import Praise from '@/components/praise/Praise';

const PraiseDetailsPage = (): JSX.Element | null => {
  const { praiseId } = useParams<PraisePageParams>();
  const praise = useSinglePraiseQuery(praiseId);
  const period = useRecoilValue(SinglePeriodByDate(praise?.createdAt));
  const backLinkUrl =
    period?._id && praise?.receiver._id
      ? `/periods/${period?._id}/receiver/${praise?.receiver._id}`
      : '/';

  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));

  if (!praise) return null;

  return (
    <div className="praise-page">
      <BreadCrumb name={'Praise details'} icon={faCalendarAlt} />
      <BackLink to={backLinkUrl} />

      <React.Suspense fallback="Loading…">
        <div className="praise-box">
          <Praise praise={praise} />
          {period && (period.status === 'CLOSED' || isAdmin) ? (
            <div>Score: {praise.scoreRealized}</div>
          ) : null}
        </div>
      </React.Suspense>

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PraiseDetailTable />
        </React.Suspense>
      </div>
    </div>
  );
};

export default PraiseDetailsPage;
