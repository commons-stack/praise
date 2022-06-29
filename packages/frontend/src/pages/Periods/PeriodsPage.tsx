import { faCalendarAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import BreadCrumb from '@/components/BreadCrumb';
import AdminOnly from '@/components/auth/AdminOnly';
import PeriodsTable from './components/Table';

const PeriodsPage = (): JSX.Element => {
  return (
    <div className="praise-page">
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />

      <ActiveNoticesBoard />

      <div className="px-0 praise-box">
        <AdminOnly>
          <div className="mb-2 text-right px-5">
            <Link to="/periods/createupdate">
              <button className="praise-button" id="create-period-button">
                <FontAwesomeIcon icon={faPlus} size="1x" className="mr-2" />
                Create period
              </button>
            </Link>
          </div>
        </AdminOnly>
        <React.Suspense fallback={null}>
          <PeriodsTable />
        </React.Suspense>
      </div>
    </div>
  );
};

export default PeriodsPage;
