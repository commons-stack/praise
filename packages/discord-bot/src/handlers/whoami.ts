import { UserModel } from 'api/dist/user/entities';
import { UserAccountModel } from 'api/dist/useraccount/entities';
import { CommandInteraction, GuildMember } from 'discord.js';
import { UserState } from '../interfaces/UserState';
import { getUserAccount } from '../utils/getUserAccount';
import { getStateEmbed } from '../utils/stateEmbed';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { dmError } from '../utils/praiseEmbeds';

export const whoamiHandler = async (
  interaction: CommandInteraction
): Promise<void> => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(await dmError());
    return;
  }

  const ua = await getUserAccount(member as GuildMember);

  const state: UserState = {
    id: ua.accountId,
    username: ua.name,
    hasPraiseGiverRole: false,
    activated: !ua.user ? false : true,
  };

  state.hasPraiseGiverRole = await assertPraiseGiver(
    member as GuildMember,
    interaction,
    false
  );

  const User = await UserModel.findOne({ _id: ua.user });
  state.praiseRoles = User?.roles || [];
  state.address = User?.ethereumAddress || '';
  state.avatar = ua.avatarId;

  const activatedAccounts = await UserAccountModel.find({ user: ua.user });
  if (activatedAccounts) {
    state.activations = [];
    for (const account of activatedAccounts) {
      state.activations.push({
        platform: account.platform,
        user: account.name,
        activationDate: account.createdAt,
        latestUsageDate: account.updatedAt,
      });
    }
  }

  await interaction.editReply({
    embeds: [getStateEmbed(state)],
  });
  return;
};
