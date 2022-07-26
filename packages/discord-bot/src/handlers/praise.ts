import { PraiseModel } from 'api/dist/praise/entities';
import { EventLogTypeKey } from 'api/src/eventlog/types';
import { logEvent } from 'api/src/eventlog/utils';
import logger from 'jet-logger';
import { GuildMember, Message, User, Util } from 'discord.js';
import { settingValue } from 'api/dist/shared/settings';
import {
  dmError,
  invalidReceiverError,
  missingReasonError,
  notActivatedDM,
  notActivatedError,
  praiseSuccess,
  praiseSuccessDM,
  roleMentionWarning,
  undefinedReceiverWarning,
  selfPraiseWarning,
  firstTimePraiserInfo,
} from '../utils/praiseEmbeds';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { CommandHandler } from '../interfaces/CommandHandler';
import { getUserAccount } from '../utils/getUserAccount';

/**
 * Execute command /praise
 *  Creates praises with a given receiver and reason
 *  with the command executor as the praise.giver
 *
 * @param  interaction
 * @param  responseUrl
 * @returns
 */
export const praiseHandler: CommandHandler = async (
  interaction,
  responseUrl
) => {
  if (!responseUrl) return;

  const { guild, channel, member } = interaction;
  if (!guild || !member || !channel) {
    await interaction.editReply(await dmError());
    return;
  }

  if (!(await assertPraiseGiver(member as GuildMember, interaction, true)))
    return;

  const receivers = interaction.options.getString('receivers');
  const receiverData = {
    validReceiverIds: receivers?.match(/<@!?([0-9]+)>/g),
    undefinedReceivers: receivers?.match(/[^<]@([a-z0-9]+)/gi),
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

  const reason = interaction.options.getString('reason');
  if (!reason || reason.length === 0) {
    await interaction.editReply(await missingReasonError());
    return;
  }

  const userAccount = await getUserAccount(member as GuildMember);
  const praiseItemsCount = await PraiseModel.countDocuments({
    giver: userAccount._id,
  });

  if (!userAccount.user) {
    await interaction.editReply(await notActivatedError());
    return;
  }

  const praised: string[] = [];
  const receiverIds = [
    ...new Set(
      receiverData.validReceiverIds.map((id: string) => id.replace(/\D/g, ''))
    ),
  ];

  const selfPraiseAllowed = (await settingValue(
    'SELF_PRAISE_ALLOWED'
  )) as boolean;

  let warnSelfPraise = false;
  if (!selfPraiseAllowed && receiverIds.includes(userAccount.accountId)) {
    warnSelfPraise = true;
    receiverIds.splice(receiverIds.indexOf(userAccount.accountId), 1);
  }
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
      giver: userAccount._id,
      sourceId: `DISCORD:${guild.id}:${interaction.channelId}`,
      sourceName: `DISCORD:${encodeURIComponent(
        guild.name
      )}:${encodeURIComponent(guildChannel?.name || '')}`,
      receiver: receiverAccount._id,
    });
    if (praiseObj) {
      await logEvent(
        EventLogTypeKey.PRAISE,
        'Created a new praise from discord',
        {
          userAccountId: userAccount._id,
        }
      );

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
        `Praise not registered for [${userAccount.accountId}] -> [${receiverAccount.accountId}] for [${reason}]`
      );
    }
  }

  Receivers.length !== 0
    ? await interaction.editReply(
        await praiseSuccess(
          praised.map((id) => `<@!${id}>`),
          reason
        )
      )
    : warnSelfPraise
    ? await interaction.editReply(await selfPraiseWarning())
    : await interaction.editReply(await invalidReceiverError());

  let warningMsg =
    (receiverData.undefinedReceivers
      ? (await undefinedReceiverWarning(
          receiverData.undefinedReceivers
            .map((id) => id.replace(/[<>]/, ''))
            .join(', '),
          member.user as User
        )) + '\n'
      : '') +
    (receiverData.roleMentions
      ? (await roleMentionWarning(
          receiverData.roleMentions.join(', '),
          member.user as User
        )) + '\n'
      : '') +
    (Receivers.length !== 0 && warnSelfPraise
      ? (await selfPraiseWarning()) + '\n'
      : '');

  if (warningMsg && warningMsg.length !== 0) {
    await interaction.followUp({ content: warningMsg, ephemeral: true });
  }

  if (praiseItemsCount === 0) {
    await msg.reply(await firstTimePraiserInfo());
  }

  return;
};
