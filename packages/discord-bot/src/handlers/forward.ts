import { PraiseModel } from 'api/dist/praise/entities';
import { Message, GuildMember, Util } from 'discord.js';
import { UserModel } from 'api/dist/user/entities';
import { EventLogTypeKey } from 'api/src/eventlog/types';
import { logEvent } from 'api/src/eventlog/utils';
import logger from 'jet-logger';
import { getSetting } from '../utils/settings';
import { getUserAccount } from '../utils/getUserAccount';
import { UserRole } from 'api/dist/user/types';
import {
  dmError,
  invalidReceiverError,
  missingReasonError,
  notActivatedDM,
  notActivatedError,
  praiseSuccessDM,
  roleMentionWarning,
  undefinedReceiverWarning,
  giverRoleError,
  forwardSuccess,
  giverNotActivatedError,
} from '../utils/praiseEmbeds';

import { praiseAllowedInChannel } from '../utils/praisePermissions';
import { CommandHandler } from 'src/interfaces/CommandHandler';

export const forwardHandler: CommandHandler = async (
  interaction,
  responseUrl
) => {
  const { guild, channel, member } = interaction;

  if (!responseUrl) return;

  if (!guild || !member || !channel) {
    await interaction.editReply(await dmError());
    return;
  }

  // pass ID of parent channel if command used in a thread.
  if (
    (await praiseAllowedInChannel(
      interaction,
      channel.type === 'GUILD_PUBLIC_THREAD' ||
        channel.type === 'GUILD_PRIVATE_THREAD'
        ? channel?.parent?.id || channel.id
        : channel.id
    )) === false
  )
    return;

  const forwarderAccount = await getUserAccount(member as GuildMember);
  if (!forwarderAccount.user) {
    await interaction.editReply(await notActivatedError());
    return;
  }
  const forwarderUser = await UserModel.findOne({ _id: forwarderAccount.user });
  if (!forwarderUser?.roles.includes(UserRole.FORWARDER)) {
    await interaction.editReply(
      "You don't have the permission to use this command."
    );
    return;
  }

  const praiseGiver = interaction.options.getMember('giver') as GuildMember;

  const praiseGiverRoleID = await getSetting('PRAISE_GIVER_ROLE_ID');
  const praiseGiverRole = guild.roles.cache.find(
    (r) => r.id === praiseGiverRoleID
  );

  if (
    praiseGiverRole &&
    !praiseGiver?.roles.cache.find((r) => r.id === praiseGiverRole?.id)
  ) {
    await interaction.editReply({
      embeds: [await giverRoleError(praiseGiverRole, praiseGiver.user)],
    });
    return;
  }
  const giverAccount = await getUserAccount(praiseGiver);

  const receivers = interaction.options.getString('receivers');
  const reason = interaction.options.getString('reason');

  const receiverData = {
    validReceiverIds: receivers?.match(/<@!([0-9]+)>/g),
    undefinedReceivers: receivers?.match(/@([a-z0-9]+)/gi),
    roleMentions: receivers?.match(/<@&([0-9]+)>/g),
  };

  if (
    !receivers ||
    receivers.length === 0 ||
    !receiverData.validReceiverIds ||
    receiverData.validReceiverIds?.length === 0
  ) {
    await interaction.editReply(await invalidReceiverError());
    return;
  }

  if (!reason || reason.length === 0) {
    await interaction.editReply(await missingReasonError());
    return;
  }

  if (!giverAccount.user) {
    await interaction.editReply(await giverNotActivatedError(praiseGiver.user));
    return;
  }

  const praised: string[] = [];
  const receiverIds = receiverData.validReceiverIds.map((id) =>
    id.substr(3, id.length - 4)
  );
  const Receivers = (await guild.members.fetch({ user: receiverIds })).map(
    (u) => u
  );

  const guildChannel = await guild.channels.fetch(channel?.id || '');

  for (const receiver of Receivers) {
    const receiverAccount = await getUserAccount(receiver);

    if (!receiverAccount.user) {
      try {
        await receiver.send({ embeds: [await notActivatedDM(responseUrl)] });
      } catch (err) {
        logger.warn(
          `Can't DM user - ${receiverAccount.name} [${receiverAccount.accountId}]`
        );
      }
    }
    const praiseObj = await PraiseModel.create({
      reason: reason,
      /**
       * ! Util.cleanContent might get deprecated in the coming versions of discord.js
       * * We would have to make our own implementation (ref: https://github.com/discordjs/discord.js/blob/988a51b7641f8b33cc9387664605ddc02134859d/src/util/Util.js#L557-L584)
       */
      reasonRealized: Util.cleanContent(reason, channel),
      giver: giverAccount._id,
      forwarder: forwarderAccount._id,
      sourceId: `DISCORD:${guild.id}:${interaction.channelId}`,
      sourceName: `DISCORD:${encodeURIComponent(
        guild.name
      )}:${encodeURIComponent(guildChannel?.name || '')}`,
      receiver: receiverAccount._id,
    });

    await logEvent(
      EventLogTypeKey.PRAISE,
      'Created a new forwarded praise from discord',
      {
        userAccountId: forwarderAccount._id,
        userId: forwarderUser._id,
      }
    );

    if (praiseObj) {
      try {
        await receiver.send({ embeds: [await praiseSuccessDM(responseUrl)] });
      } catch (err) {
        logger.warn(
          `Can't DM user - ${receiverAccount.name} [${receiverAccount.accountId}]`
        );
      }
      praised.push(receiverAccount.accountId);
    } else {
      logger.err(
        `Praise not registered for [${giverAccount.accountId}] -> [${receiverAccount.accountId}] for [${reason}]`
      );
    }
  }

  const msg = (await interaction.editReply(
    await forwardSuccess(
      praiseGiver.user,
      praised.map((id) => `<@!${id}>`),
      reason
    )
  )) as Message;

  if (receiverData.undefinedReceivers) {
    await msg.reply(
      await undefinedReceiverWarning(
        receiverData.undefinedReceivers.join(', '),
        praiseGiver.user
      )
    );
  }
  if (receiverData.roleMentions) {
    await msg.reply(
      await roleMentionWarning(
        receiverData.roleMentions.join(', '),
        praiseGiver.user
      )
    );
  }

  return;
};
