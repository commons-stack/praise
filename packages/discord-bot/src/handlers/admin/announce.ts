import { UserAccountModel } from 'api/dist/useraccount/entities';
import { UserAccount } from 'api/src/useraccount/types';
import { UserModel } from 'api/dist/user/entities';
import {
  continueButton,
  cancelButton,
} from '../../utils/buttons/confirmationButtons';
import { dmTargetMenu } from '../../utils/menus/dmTargetmenu';
import { Message, SelectMenuInteraction, MessageActionRow } from 'discord.js';
import { UserRole } from 'api/dist/user/types';
import { selectTargets } from '../../utils/dmTargets';
import { PeriodModel } from 'api/dist/period/entities';
import { periodSelectMenu } from '../../utils/menus/periodSelectMenu';
import { notActivatedError } from '../../utils/praiseEmbeds';
import { CommandHandler } from 'src/interfaces/CommandHandler';

export const announcementHandler: CommandHandler = async (interaction) => {
  const { user } = interaction;
  const ua = {
    accountId: user.id,
    name: user.username + '#' + user.discriminator,
    avatarId: user.avatar,
    platform: 'DISCORD',
  } as UserAccount;
  const userAccount = await UserAccountModel.findOneAndUpdate(
    { accountId: user.id },
    ua,
    { upsert: true, new: true }
  );
  if (!userAccount.user) {
    await interaction.editReply(await notActivatedError());
    return;
  }
  const currentUser = await UserModel.findOne({ _id: userAccount.user });

  if (currentUser?.roles.includes(UserRole.ADMIN)) {
    const message = interaction.options.getString('message');

    const userSelectionMsg = (await interaction.editReply({
      content: 'Which users do you want to send the message to?',
      components: [new MessageActionRow().addComponents([dmTargetMenu])],
    })) as Message;

    const collector = userSelectionMsg.createMessageComponentCollector({
      filter: (click) => click.user.id === interaction.user.id,
      time: 900000,
    });
    let selectedUserType: string;
    let selectedPeriod: string | undefined;
    collector.on('collect', async (click) => {
      await click.deferUpdate();
      switch (click.customId) {
        case 'dm-menu': {
          if (!click.isSelectMenu()) break;
          const menu: SelectMenuInteraction = click;
          selectedUserType = menu.values[0];
          if (
            selectedUserType === 'ASSIGNED-QUANTIFIERS' ||
            selectedUserType === 'UNFINISHED-QUANTIFIERS'
          ) {
            const openPeriods = await PeriodModel.find({ status: 'QUANTIFY' });
            if (!openPeriods.length) {
              await interaction.editReply({
                content: 'No periods open for quantification.',
                components: [],
              });
              return;
            }
            await interaction.editReply({
              content: 'Which period are you referring to?',
              components: [
                new MessageActionRow().addComponents([
                  periodSelectMenu(openPeriods),
                ]),
              ],
            });
            break;
          }
          selectedPeriod = '';
          await interaction.editReply({
            content: `Preview announcement before continuing:\n---\n${
              message || ''
            }\n---`,
            components: [
              new MessageActionRow().addComponents([
                continueButton,
                cancelButton,
              ]),
            ],
          });
          break;
        }
        case 'period-menu': {
          if (!click.isSelectMenu()) return;
          selectedPeriod = click.values[0];
          await interaction.editReply({
            content: `Preview announcement before continuing:\n---\n${
              message || ''
            }\n---`,
            components: [
              new MessageActionRow().addComponents([
                continueButton,
                cancelButton,
              ]),
            ],
          });
          break;
        }
        case 'continue': {
          await interaction.editReply({
            content: 'Sending…',
            components: [],
          });
          await selectTargets(
            interaction,
            selectedUserType,
            selectedPeriod,
            message || ''
          );
          break;
        }
        case 'cancel': {
          await interaction.editReply({
            content: 'User cancelled Interaction.',
            components: [],
          });
          return;
        }
      }
    });
    collector.on('end', async (collected) => {
      const successfulEndEvents = ['cancel', 'continue'];
      const ended = collected.some((clk) =>
        successfulEndEvents.includes(clk.customId)
      );
      if (!ended) {
        await interaction.followUp({
          content: 'Interaction timed out...',
          embeds: [],
          components: [],
        });
      }
    });
  } else {
    await interaction.editReply({
      content:
        'You do not have the needed permissions to use this command. If you would like to perform admin actions, you would need to be granted an `ADMIN` role on the Praise Dashboard.',
    });
    return;
  }
};
