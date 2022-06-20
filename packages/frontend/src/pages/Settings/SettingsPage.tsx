import { SettingGroup } from 'api/dist/settings/types';
import BreadCrumb from '@/components/BreadCrumb';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import SettingsForm from '../../components/settings/SettingsForm';
import { AllSettings, useSetSetting } from '@/model/settings';
import { useRecoilValue } from 'recoil';
import NavItem from '@/navigation/NavItem';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

const SettingsPage = (): JSX.Element | null => {
  const settings = useRecoilValue(AllSettings);
  const { setSetting } = useSetSetting();
  const { path, url } = useRouteMatch();

  if (!settings) return null;

  const applicationSettings = settings.filter(
    (s) => s.group === SettingGroup.APPLICATION
  );
  const periodDefaultSettings = settings.filter(
    (s) => s.group === SettingGroup.PERIOD_DEFAULT
  );
  const discordSettings = settings.filter(
    (s) => s.group === SettingGroup.DISCORD
  );

  return (
    <div className="praise-page">
      <BreadCrumb name="Settings" icon={faCogs} />

      <div className="flex space-x-4">
        <div>
          <div className="w-40 py-5 mb-5 break-words border rounded-lg shadow-sm bg-gray-50 dark:bg-slate-600">
            <nav>
              <NavItem to={`${url}/application`} description="Application" />
              <NavItem to={`${url}/period`} description="Period Defaults" />
              <NavItem to={`${url}/discord`} description="Discord Bot" />
            </nav>
          </div>
        </div>

        <div className="w-full max-w-3xl praise-box">
          <Switch>
            <Route path={`${path}/application`}>
              <React.Suspense fallback="Loading…">
                <SettingsForm
                  settings={applicationSettings}
                  setSetting={setSetting}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}/period`}>
              <React.Suspense fallback="Loading…">
                <SettingsForm
                  settings={periodDefaultSettings}
                  setSetting={setSetting}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}/discord`}>
              <React.Suspense fallback="Loading…">
                <SettingsForm
                  settings={discordSettings}
                  setSetting={setSetting}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}`}>
              <Redirect to={`${url}/application`} />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
