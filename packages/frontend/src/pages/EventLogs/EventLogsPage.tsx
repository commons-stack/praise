import BreadCrumb from '@/components/BreadCrumb';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { Suspense } from 'react';
import EventLogsList from './components/EventLogsList';

const EventLogsPage = (): JSX.Element => {
  return (
    <div className="praise-page">
      <BreadCrumb name="Transparency Log" icon={faBook} />

      <div className="w-full praise-box overflow-x-auto">
        <h2 className="mb-2">Transparency Log</h2>
        <p>A log of all user actions that change the database state.</p>
      </div>

      <Suspense fallback="Loading…">
        <EventLogsList />
      </Suspense>
    </div>
  );
};

export default EventLogsPage;
