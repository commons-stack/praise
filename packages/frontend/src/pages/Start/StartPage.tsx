import BreadCrumb from '@/components/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React, { ReactElement } from 'react';
import PraiseTable from './components/PraiseTable';

const StartPage: React.FC = (): ReactElement => {
  return (
    <div className="praise-page">
      <BreadCrumb name="Praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PraiseTable />
        </React.Suspense>
      </div>
    </div>
  );
};

export default StartPage;
