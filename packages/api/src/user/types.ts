import { Document } from 'mongoose';
import { UserAccountDocument, UserAccountDto } from '@/useraccount/types';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  QUANTIFIER = 'QUANTIFIER',
  FORWARDER = 'FORWARDER',
}

interface User {
  ethereumAddress: string;
  roles: UserRole[];
  accounts?: UserAccountDocument[];
  nonce?: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends User, Document {}

export interface UserDto {
  _id: string;
  ethereumAddress?: string;
  roles: string[];
  accounts?: UserAccountDto[];
  nonce?: string;
  accessToken?: string;
  nameRealized: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleChangeInput {
  role: UserRole;
}
