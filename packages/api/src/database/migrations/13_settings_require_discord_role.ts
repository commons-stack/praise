import { SettingGroup } from '@settings/types';
import { SettingsModel } from '../../settings/entities';

const newSetting = [
  {
    key: 'PRAISE_GIVER_ROLE_ID_REQUIRED',
    value: false,
    type: 'Boolean',
    label: 'Praise Giver Discord Role Required',
    description:
      'Checking this box requires users to be assigned to the Discord Role ID specified in "Praise Giver Discord Role" in order to praise.',
    group: SettingGroup.DISCORD,
  },
];

const updatedSetting = [
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    description:
      'Discord Role ID authorized to praise or forward praise. Used only if "Praise Giver Discord Role Required" is checked.',
  },
];

const oldSetting = [
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    description: 'Discord Role ID authorized to dish praise',
  },
];

const up = async (): Promise<void> => {
  const ns = newSetting.map((s) => ({
    updateOne: {
      filter: { key: s.key },

      // Insert setting if not found, otherwise continue
      update: { $setOnInsert: { ...s } },
      upsert: true,
    },
  }));
  await SettingsModel.bulkWrite(ns);

  const us = updatedSetting.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: { $set: { description: s.description } },
    },
  }));
  await SettingsModel.bulkWrite(us);
};

const down = async (): Promise<void> => {
  const allKeys = newSetting.map((s) => s.key);
  await SettingsModel.deleteMany({ key: { $in: allKeys } });

  const os = oldSetting.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: { $set: { description: s.description } },
    },
  }));
  await SettingsModel.bulkWrite(os);
};

export { up, down };
