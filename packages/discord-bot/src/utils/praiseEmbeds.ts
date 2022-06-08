import { User, MessageEmbed, Role } from 'discord.js';
import { settingValue } from 'api/dist/shared/settings';

export const praiseSuccess = async (
  praised: string[],
  reason: string
): Promise<string> => {
  const msg = (await settingValue('PRAISE_SUCCESS_MESSAGE')) as string;
  if (msg && typeof msg === 'string') {
    return msg
      ?.replace('{@receivers}', `${praised.join(', ')}`)
      .replace('{reason}', reason);
  } else {
    return 'PRAISE SUCCESSFUL (message not set)';
  }
};

export const forwardSuccess = async (
  giver: User,
  receivers: string[],
  reason: string
): Promise<string> => {
  const msg = (await settingValue('FORWARD_SUCCESS_MESSAGE')) as string;
  if (msg && typeof msg === 'string') {
    return msg
      ?.replace('{@giver}', `<@!${giver.id}>`)
      .replace('{@receivers}', `${receivers.join(', ')}`)
      .replace('{reason}', reason);
  } else {
    return 'PRAISE SUCCESSFUL (message not set)';
  }
};

export const praiseError = (title: string, description: string): string => {
  return `**❌ ${title}**\n${description}`;
};

export const notActivatedError = async (): Promise<string> => {
  const msg = (await settingValue(
    'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR'
  )) as string;
  if (msg && typeof msg === 'string') {
    return msg;
  } else {
    return 'PRAISE ACCOUNT NOT ACTIVATED (message not set)';
  }
};

export const alreadyActivatedError = async (): Promise<string> => {
  const msg = (await settingValue(
    'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR'
  )) as string;
  if (msg && typeof msg === 'string') {
    return msg;
  } else {
    return 'PRAISE ACCOUNT ALREADY ACTIVATED (message not set)';
  }
};

export const giverNotActivatedError = async (
  praiseGiver: User
): Promise<string> => {
  const msg = (await settingValue(
    'FORWARD_FROM_UNACTIVATED_GIVER_ERROR'
  )) as string;
  if (msg && typeof msg === 'string') {
    return msg
      .replace(
        '{giver}',
        `${praiseGiver.username}#${praiseGiver.discriminator}`
      )
      .replace('{@giver}', `<@!${praiseGiver.id}>`);
  } else {
    return "PRAISE GIVER'S ACCOUNT NOT ACTIVATED (message not set)";
  }
};

export const dmError = async (): Promise<string> => {
  const msg = (await settingValue('DM_ERROR')) as string;
  if (msg && typeof msg === 'string') {
    return msg;
  } else {
    return 'COMMAND CAN NOT BE USED IN DM (message not set)';
  }
};

export const praiseRoleError = async (
  praiseGiverRole: Role,
  user: User
): Promise<MessageEmbed> => {
  const msg = (await settingValue(
    'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR'
  )) as string;
  if (msg && typeof msg === 'string') {
    return new MessageEmbed().setColor('#ff0000').setDescription(
      msg
        .replace('{role}', praiseGiverRole?.name || '...')
        .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
        .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
        .replace('{@user}', `<@!${user?.id || '...'}>`)
    );
  }
  return new MessageEmbed().setColor('#ff0000').setDescription(
    'USER DOES NOT HAVE {@role} role (message not set)'
      .replace('{role}', praiseGiverRole?.name || '...')
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
      .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
      .replace('{@user}', `<@!${user?.id || '...'}>`)
  );
};

export const forwardRoleError = async (
  praiseGiverRole: Role,
  user: User
): Promise<MessageEmbed> => {
  const msg = (await settingValue(
    'FORWARD_FROM_USER_WITHOUT_PRAISE_GIVER_ROLE_ERROR'
  )) as string;
  if (msg && typeof msg === 'string') {
    return new MessageEmbed().setColor('#ff0000').setDescription(
      msg
        .replace('{role}', praiseGiverRole?.name || '...')
        .replace('{giver}', `${user?.username}#${user?.discriminator}` || '...')
        .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
        .replace('{@giver}', `<@!${user?.id || '...'}>`)
    );
  }
  return new MessageEmbed().setColor('#ff0000').setDescription(
    'GIVER DOES NOT HAVE {@role} role (message not set)'
      .replace('{role}', praiseGiverRole?.name || '...')
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
      .replace('{@role}', `<@&${praiseGiverRole?.id}>`)
      .replace('{@user}', `<@!${user?.id || '...'}>`)
  );
};

export const invalidReceiverError = async (): Promise<string> => {
  const msg = (await settingValue('PRAISE_INVALID_RECEIVERS_ERROR')) as string;
  if (msg && typeof msg === 'string') {
    return msg;
  }
  return 'VALID RECEIVERS NOT MENTIONED (message not set)';
};

export const missingReasonError = async (): Promise<string> => {
  const msg = (await settingValue('PRAISE_INVALID_RECEIVERS_ERROR')) as string;
  if (msg && typeof msg === 'string') {
    return msg;
  }
  return 'REASON NOT MENTIONED (message not set)';
};

export const undefinedReceiverWarning = async (
  receivers: string,
  user: User
): Promise<string> => {
  const msg = (await settingValue(
    'PRAISE_UNDEFINED_RECEIVERS_WARNING'
  )) as string;
  if (msg && typeof msg === 'string') {
    return msg
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...')
      .replace('{@user}', `<@!${user?.id || '...'}>`)
      .replace('{@receivers}', receivers);
  }
  return 'UNDEFINED RECEIVERS MENTIONED, UNABLE TO PRAISE THEM (message not set)';
};

export const roleMentionWarning = async (
  receivers: string,
  user: User
): Promise<string> => {
  const msg = (await settingValue('PRAISE_TO_ROLE_WARNING')) as String;
  if (msg && typeof msg === 'string') {
    return msg
      .replace('{@receivers}', receivers)
      .replace('{@user}', `<@!${user?.id || '...'}>`)
      .replace('{user}', `${user?.username}#${user?.discriminator}` || '...');
  }
  return "ROLES MENTIONED AS PRAISE RECEIVERS, PRAISE CAN'T BE DISHED TO ROLES (message not set)";
};

export const praiseSuccessDM = async (
  msgUrl: string
): Promise<MessageEmbed> => {
  const msg = (await settingValue('PRAISE_SUCCESS_DM')) as string;
  if (msg && typeof msg === 'string') {
    return new MessageEmbed()
      .setColor('#696969')
      .setDescription(msg.replace('{praiseURL}', msgUrl));
  }
  return new MessageEmbed().setDescription(
    `[YOU HAVE BEEN PRAISED!!!](${msgUrl}) (message not set)`
  );
};

export const notActivatedDM = async (msgUrl: string): Promise<MessageEmbed> => {
  const msg = (await settingValue(
    'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM'
  )) as string;
  if (msg && typeof msg === 'string') {
    return new MessageEmbed()
      .setColor('#ff0000')
      .setTitle('**⚠️  Praise Account Not Activated**')
      .setDescription(msg.replace('{praiseURL}', msgUrl));
  }
  return new MessageEmbed().setDescription(
    `**[YOU HAVE BEEN PRAISED](${msgUrl})\nPRAISE ACCOUNT NOT ACTIVATED. USE \`/activate\` TO ACTIVATE YOUR ACCOUNT. (message not set)`
  );
};
