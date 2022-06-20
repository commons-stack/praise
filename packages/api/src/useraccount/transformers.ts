import { UserAccountDocument, UserAccountDto } from './types';
import { generateUserAccountNameRealized } from './utils';

const userAccountDocumentToDto = (
  userAccountDocument: UserAccountDocument
): UserAccountDto => {
  const {
    _id,
    user,
    accountId,
    name,
    avatarId,
    platform,
    createdAt,
    updatedAt,
  } = userAccountDocument;
  return {
    _id,
    user: user?._id,
    accountId,
    name,
    nameRealized: generateUserAccountNameRealized(userAccountDocument),
    avatarId,
    platform,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

export const userAccountListTransformer = (
  userAccountDocuments: UserAccountDocument[] | undefined
): UserAccountDto[] => {
  if (userAccountDocuments && Array.isArray(userAccountDocuments)) {
    return userAccountDocuments.map((d) => userAccountDocumentToDto(d));
  }
  return [];
};

export const userAccountTransformer = (
  userAccountDocument: UserAccountDocument
): UserAccountDto => {
  return userAccountDocumentToDto(userAccountDocument);
};
