import BreadCrumb from '@/components/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import MyPraiseTable from './components/MyPraiseTable';

const MyPraise = (): JSX.Element => {
  return (
    <div className="praise-page">
      <BreadCrumb name="My praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <div className="praise-box px-0">
        <React.Suspense fallback="Loading…">
          <MyPraiseTable />
        </React.Suspense>
      </div>
    </div>
  );
};

export default MyPraise;
