import { UserAccountModel } from 'api/dist/useraccount/entities';
import { UserAccount } from 'api/src/useraccount/types';
import { EventLogTypeKey } from 'api/src/eventlog/types';
import { logEvent } from 'api/src/eventlog/utils';
import randomstring from 'randomstring';
import { CommandHandler } from 'src/interfaces/CommandHandler';
import { alreadyActivatedError } from '../utils/praiseEmbeds';

/**
 * Executes command /activate
 *  Creates a one-time link on the Praise frontend linking to the activate page
 *  where the user can associate their Discord user with a UserAccount
 *
 * @param  interaction
 * @returns
 */
export const activationHandler: CommandHandler = async (interaction) => {
  const { user } = interaction;

  let userAccount = await UserAccountModel.findOne({
    accountId: user.id,
    platform: 'DISCORD',
  });

  if (userAccount?.user) {
    await interaction.reply({
      content: await alreadyActivatedError(),
      ephemeral: true,
    });
    return;
  }

  const ua = {
    accountId: user.id,
    name: user.username + '#' + user.discriminator,
    avatarId: user.avatar,
    platform: 'DISCORD',
    activateToken: randomstring.generate(),
  } as UserAccount;

  userAccount = await UserAccountModel.findOneAndUpdate(
    { accountId: user.id },
    ua,
    { upsert: true, new: true }
  );

  if (!userAccount) {
    await interaction.reply({
      content: 'Unable to create user account.',
      ephemeral: true,
    });
    return;
  }

  await logEvent(
    EventLogTypeKey.AUTHENTICATION,
    'Ran the /activate command on discord',
    {
      userAccountId: userAccount._id,
    }
  );

  const getActivationURL = (
    accountId: string,
    uname: string,
    hash: string,
    token: string
  ): string =>
    `${
      process.env.FRONTEND_URL as string
    }/activate?accountId=${accountId}&accountName=${encodeURIComponent(
      `${uname}#${hash}`
    )}&platform=DISCORD&token=${token}`;

  const activationURL = getActivationURL(
    ua.accountId,
    user.username,
    user.discriminator,
    ua.activateToken || 'undefined'
  );

  await interaction.reply({
    content: `To activate your account, follow this link and sign a message using your Ethereum wallet. [Activate my account!](${activationURL})`,
    ephemeral: true,
  });
};
