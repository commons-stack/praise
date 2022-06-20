import { atom } from 'recoil';

export const Theme = atom<string>({
  key: 'Theme',
  default: localStorage.getItem('theme') || 'Light',
});
