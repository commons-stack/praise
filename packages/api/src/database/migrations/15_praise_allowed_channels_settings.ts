import { SettingGroup } from '@settings/types';
import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'PRAISE_ALLOWED_IN_ALL_CHANNELS',
    value: true,
    type: 'Boolean',
    label: 'Praising allowed in all Channels',
    description:
      'If enabled, this allows praise to be dished in all channels in the server',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_ALLOWED_CHANNEL_IDS',
    value: '0, 0',
    type: 'IntegerList',
    label: 'Channels where praise is allowed',
    description: 'List of channel IDs in which discord users can use praise',
    group: SettingGroup.DISCORD,
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },

      // Insert setting if not found, otherwise continue
      update: { $setOnInsert: { ...s } },
      upsert: true,
    },
  }));

  await SettingsModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingsModel.deleteMany({ key: { $in: allKeys } });
};

export { up, down };
