import { ethers } from 'ethers';
import { Response } from 'express';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '@/error/errors';
import { EventLogTypeKey } from '@/eventlog/types';
import { logEvent } from '@/eventlog/utils';
import { TypedRequestBody } from '@/shared/types';
import { UserModel } from '@/user/entities';
import { UserAccountModel } from '@/useraccount/entities';
import { ActivateRequestBody } from './types';
import { generateActivateMessage } from './utils';

/**
 * Activate a useraccount and associate it with a user.
 *
 * @param  {TypedRequestBody<ActivateRequestBody>} req
 * @param  {Response} res
 * @returns Promise
 */
const activate = async (
  req: TypedRequestBody<ActivateRequestBody>,
  res: Response
): Promise<void> => {
  const { ethereumAddress, signature, accountId } = req.body;

  if (!ethereumAddress || !signature || !accountId)
    throw new BadRequestError(
      'ethereumAddress, signature, and accountId required'
    );

  // Find previously generated token
  const userAccount = await UserAccountModel.findOne({ accountId })
    .select('_id user activateToken')
    .exec();

  if (!userAccount) throw new NotFoundError('UserAccount');
  if (!userAccount.activateToken)
    throw new InternalServerError('Activation token not found.');

  // You are only allowed to activate once
  if (userAccount.user)
    throw new BadRequestError('User account already activated.');

  // Generate expected message, token included.
  const generatedMsg = generateActivateMessage(
    accountId,
    ethereumAddress,
    userAccount.activateToken
  );

  // Verify signature against generated message
  // Recover signer and compare against query address
  const signerAddress = ethers.utils.verifyMessage(generatedMsg, signature);
  if (signerAddress !== ethereumAddress)
    throw new UnauthorizedError('Verification failed.');

  // Find existing user or create new
  const user = await UserModel.findOneAndUpdate(
    { ethereumAddress },
    { ethereumAddress },
    { upsert: true, new: true }
  );
  if (!user) throw new NotFoundError('User');

  // Link user account with user
  userAccount.user = user;
  userAccount.activateToken = undefined;
  await userAccount.save();

  await logEvent(EventLogTypeKey.AUTHENTICATION, 'Activated account', {
    userAccountId: userAccount._id,
    userId: user._id,
  });

  res.status(200).json(user);
};

export { activate };
