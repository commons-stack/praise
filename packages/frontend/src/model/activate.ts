import { atom } from 'recoil';

export const AccountActivated = atom<boolean>({
  key: 'AccountActivated',
  default: false,
});
