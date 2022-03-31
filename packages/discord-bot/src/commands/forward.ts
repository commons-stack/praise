import { SlashCommandBuilder } from '@discordjs/builders';
import { APIMessage } from 'discord-api-types/v9';
import logger from 'jet-logger';
import { forwardHandler } from '../handlers/forward';
import { Command } from '../interfaces/Command';
import { getMsgLink } from '../utils/format';

export const forward: Command = {
  data: new SlashCommandBuilder()
    .setName('forward')
    .setDescription('Praise a contribution on behalf of another user.')
    .addUserOption((option) =>
      option
        .setName('giver')
        .setDescription('Mention the user for whom you forward the praise.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('receivers')
        .setDescription('Mention the user(s) who should receive the praise.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Describe the reason for this praise.')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'forward')
        return;

      const msg = (await interaction.deferReply({
        fetchReply: true,
      })) as APIMessage | void;
      if (msg === undefined) return;
      await forwardHandler(
        interaction,
        getMsgLink(
          interaction.guildId || '',
          interaction.channelId || '',
          msg.id
        )
      );
    } catch (err) {
      logger.err(err);
    }
  },
};
