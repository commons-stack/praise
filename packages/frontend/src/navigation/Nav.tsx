import AdminOnly from '@/components/auth/AdminOnly';
import EthAccount from '@/components/account/EthAccount';
import { SingleSetting } from '@/model/settings';
import {
  faCalculator,
  faCog,
  faPrayingHands,
  faQuestionCircle,
  faUserFriends,
  faBook,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { useRecoilValue, useRecoilState } from 'recoil';
import { Theme } from '@/model/theme';
import NavItem from './NavItem';
import { classNames } from '../utils';

export default function Nav(): JSX.Element {
  const [theme, setTheme] = useRecoilState(Theme);
  const logoSetting = useRecoilValue(SingleSetting('LOGO'));

  const handleTheme = (theme: string): void => {
    if (theme === 'Dark') {
      setTheme('Dark');
      localStorage.setItem('theme', 'Dark');
    } else {
      setTheme('Light');
      localStorage.setItem('theme', 'Light');
    }
  };

  return (
    <nav className="flex h-screen border-r shadow-sm md:w-64 md:flex-col md:fixed bg-gray-50 dark:bg-slate-900 dark:text-white">
      <div className="flex flex-col justify-between h-full">
        <div className="w-full">
          <ul className="relative h-full p-0 m-0 list-none">
            <li className="relative flex justify-start w-full p-4 text-2xl font-bold">
              <Link to="/">
                {logoSetting && (
                  <img
                    src={logoSetting.valueRealized as string}
                    className={'inline-block w-52'}
                  />
                )}
              </Link>
            </li>

            <NavItem
              icon={faPrayingHands}
              description="My praise"
              to="/mypraise"
            />
            <AdminOnly>
              <NavItem icon={faUserFriends} description="Users" to="/users" />
            </AdminOnly>
            <NavItem
              icon={faCalculator}
              description="Quantification periods"
              to="/periods"
            />
            <NavItem
              icon={faBook}
              description="Transparency Log"
              to="/eventlogs"
            />
            <AdminOnly>
              <NavItem
                icon={faCog}
                description="Settings"
                to="/settings/application"
              />
            </AdminOnly>
            <NavItem icon={faQuestionCircle} description="FAQ" to="/faq" />
          </ul>
        </div>
        <div className="h-12 m-4 mt-auto flex">
          {/* <div>{theme} mode</div>
          <Switch
            checked={theme === 'Dark'}
            onChange={handleTheme}
            icon={<FontAwesomeIcon icon={faSun} size="lg" />}
            checkedIcon={<FontAwesomeIcon icon={faMoon} size="lg" />}
          /> */}
          <div
            className={classNames(
              theme === 'Light' ? 'bg-blue-100/50 text-blue-500' : '',
              'cursor-pointer grow rounded-l-lg border-2 border-r flex items-center justify-center gap-4'
            )}
            onClick={(): void => handleTheme('Light')}
          >
            <FontAwesomeIcon icon={faSun} size="lg" />
            Light
          </div>
          <div
            className={classNames(
              theme === 'Dark' ? 'bg-blue-800/20' : '',
              'cursor-pointer grow rounded-r-lg border-2 border-l flex items-center justify-center gap-4'
            )}
            onClick={(): void => handleTheme('Dark')}
          >
            Dark
            <FontAwesomeIcon icon={faMoon} size="lg" />
          </div>
        </div>

        <div className="w-full border-t">
          <Menu as="div" className="flex flex-col justify-center">
            <Menu.Button className="flex items-center justify-between w-full selection:hover:text-gray-500 focus:outline-none">
              <EthAccount
                showDownCaret={false}
                showRightCaret={true}
                className="w-full px-4 py-3"
              />
            </Menu.Button>
          </Menu>
        </div>
      </div>
    </nav>
  );
}
