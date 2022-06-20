import { PraiseModel } from 'api/dist/praise/entities';
import { Message, GuildMember, Util } from 'discord.js';
import { UserModel } from 'api/dist/user/entities';
import { EventLogTypeKey } from 'api/src/eventlog/types';
import { logEvent } from 'api/src/eventlog/utils';
import logger from 'jet-logger';
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
  forwardSuccess,
  giverNotActivatedError,
} from '../utils/praiseEmbeds';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';

import { assertPraiseAllowedInChannel } from '../utils/assertPraiseAllowedInChannel';
import { CommandHandler } from 'src/interfaces/CommandHandler';

export const forwardHandler: CommandHandler = async (
  interaction,
  responseUrl
) => {
  if (!responseUrl) return;

  const { guild, channel, member } = interaction;
  if (!guild || !member || !channel) {
    await interaction.editReply(await dmError());
    return;
  }

  const forwarderAccount = await getUserAccount(member as GuildMember);
  if (!forwarderAccount.user) {
    await interaction.editReply(await notActivatedError());
    return;
  }

  const forwarderUser = await UserModel.findOne({ _id: forwarderAccount.user });
  if (!forwarderUser?.roles.includes(UserRole.FORWARDER)) {
    await interaction.editReply(
      "**❌ You don't have the permission to use this command.**"
    );
    return;
  }

  if ((await assertPraiseAllowedInChannel(interaction)) === false) return;

  const praiseGiver = interaction.options.getMember('giver') as GuildMember;
  if (!praiseGiver) {
    await interaction.editReply('**❌ No Praise giver specified**');
    return;
  }

  if (!(await assertPraiseGiver(praiseGiver, interaction, true))) return;

  const receivers = interaction.options.getString('receivers');
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

  const reason = interaction.options.getString('reason');
  if (!reason || reason.length === 0) {
    await interaction.editReply(await missingReasonError());
    return;
  }

  const giverAccount = await getUserAccount(praiseGiver);
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
