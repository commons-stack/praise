import BreadCrumb from '@/components/BreadCrumb';
import { HasRole, ROLE_ADMIN } from '@/model/auth';
import {
  PeriodPageParams,
  SinglePeriod,
  useSinglePeriodQuery,
} from '@/model/periods';
import BackLink from '@/navigation/BackLink';
import PeriodDetailsComponent from '@/pages/Periods/Details/components/Details';
import { classNames } from '@/utils/index';
import { PeriodStatusType } from 'api/dist/period/types';
import {
  faBalanceScaleLeft,
  faHeartbeat,
  faCalendarAlt,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import React, { Suspense } from 'react';
import {
  useParams,
  useRouteMatch,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PeriodNameForm from './components/PeriodNameForm';
import { QuantifierMessage } from './components/QuantifierMessage';
import NavItem from '../../../navigation/NavItem';
import QuantifierTable from './components/QuantifierTable';
import ReceiverTable from './components/ReceiverTable';
import PeriodSettingsForm from './components/PeriodSettingsForm';

const PeriodDetailHead = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const period = useRecoilValue(SinglePeriod(periodId));
  return (
    <>
      {' '}
      <div
        className={classNames(
          period?.status === 'OPEN'
            ? 'bg-green-300'
            : period?.status === 'QUANTIFY'
            ? 'bg-pink-300'
            : 'bg-gray-300',
          'float-right px-2 py-1 text-xs text-white rounded-full'
        )}
      >
        {period
          ? period.status === 'QUANTIFY'
            ? 'QUANTIFYING'
            : period.status
          : null}
      </div>
      {isAdmin ? <PeriodNameForm /> : <h2>{period?.name}</h2>}
      <PeriodDetailsComponent />
    </>
  );
};

const PeriodDetailPage = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const isAdmin = useRecoilValue(HasRole(ROLE_ADMIN));
  const { path, url } = useRouteMatch();
  useSinglePeriodQuery(periodId);

  if (!period || !period.receivers) return null;

  return (
    <div className="praise-page">
      <BreadCrumb name="Quantification periods" icon={faCalendarAlt} />
      <BackLink to="/periods" />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodDetailHead />
        </React.Suspense>
      </div>

      <React.Suspense fallback="Loading…">
        <QuantifierMessage />
      </React.Suspense>

      <div className="flex flex-col sm:space-x-4 sm:flex-row">
        <div>
          <div className="w-40 py-5 mb-5 break-words border rounded-lg shadow-sm bg-gray-50 dark:bg-slate-600">
            <nav>
              <NavItem
                to={`${url}/receivers`}
                description="Receivers"
                icon={faHeartbeat}
              />
              <NavItem
                to={`${url}/quantifiers`}
                description="Quantifiers"
                icon={faBalanceScaleLeft}
              />
              <NavItem
                to={`${url}/settings`}
                description="Settings"
                icon={faCog}
              />
            </nav>
          </div>
        </div>

        <div className="w-full praise-box px-0">
          <Suspense fallback="Loading…">
            <Switch>
              <Route path={`${path}/receivers`}>
                <ReceiverTable />
              </Route>
              <Route path={`${path}/quantifiers`}>
                <QuantifierTable />
              </Route>
              <Route path={`${path}/settings`}>
                <PeriodSettingsForm
                  periodId={periodId}
                  disabled={period.status !== PeriodStatusType.OPEN || !isAdmin}
                />
              </Route>
              <Route path={`${path}`}>
                <Redirect to={`${url}/receivers`} />
              </Route>
            </Switch>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default PeriodDetailPage;
