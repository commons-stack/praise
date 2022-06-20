import { SettingGroup } from '@settings/types';
import { SettingsModel } from '@settings/entities';
import { PeriodSettingsModel } from '@periodsettings/entities';
import { PeriodModel } from '@period/entities';
import { PeriodDocument } from '@period/types';

const newSetting = {
  key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
  value: false,
  type: 'Boolean',
  label: 'Assign praise to all quantifiers',
  description:
    'Evenly assign praise among all quantifiers. If enabled, the setting "Quantifiers Per Praise" will be ignored',
  group: SettingGroup.PERIOD_DEFAULT,
};

const up = async (): Promise<void> => {
  await SettingsModel.create(newSetting);

  const periods = await PeriodModel.find({});
  const periodsettings = periods.map((p: PeriodDocument) => ({
    ...newSetting,
    period: p._id,
  }));

  await PeriodSettingsModel.insertMany(periodsettings);
};

const down = async (): Promise<void> => {
  await SettingsModel.deleteMany({ key: newSetting.key });
  await PeriodSettingsModel.deleteMany({ key: newSetting.key });
};

export { up, down };
