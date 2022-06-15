import { CommandInteraction, TextBasedChannel } from 'discord.js';
import { settingValue } from 'api/dist/shared/settings';

const getChannelId = (channel: TextBasedChannel): string => {
  return channel.type === 'GUILD_PUBLIC_THREAD' ||
    channel.type === 'GUILD_PRIVATE_THREAD' ||
    channel.type === 'GUILD_NEWS_THREAD'
    ? channel?.parent?.id || channel.id
    : channel.id;
};

export const assertPraiseAllowedInChannel = async (
  interaction: CommandInteraction
): Promise<boolean> => {
  const { channel } = interaction;
  const allowedInAllChannels = (await settingValue(
    'PRAISE_ALLOWED_IN_ALL_CHANNELS'
  )) as boolean;
  const allowedChannelsList = (await settingValue(
    'PRAISE_ALLOWED_CHANNEL_IDS'
  )) as number[];
  if (
    !channel ||
    (!allowedInAllChannels &&
      !allowedChannelsList.includes(Number.parseInt(getChannelId(channel))))
  ) {
    await interaction.editReply(
      `**❌ Praise Restricted**\nPraise not allowed in this channel.\nTo praise, use the following channels - ${allowedChannelsList
        .map((id) => {
          `<#${id.toString()}>`;
        })
        .join(', ')}.`
    );
    return false;
  } else {
    return true;
  }
};
