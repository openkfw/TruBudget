export interface CreateUserTransaction {
  type: string;
  source: string;
  publisher: string;
  user: User;
  time: Date;
}

export interface User {
  id: string;
  displayName: string;
  organization: string;
  passwordHash: string;
  address: string;
  encryptedPrivKey: string;
  permissions: CreatePermissions;
  additionalData: any;
}

export interface CreatePermissions {
  userView: string[];
  userAuthenticate: string[];
  userChangePassword: string[];
  userIntentListPermissions: string[];
  userIntentGrantPermission: string[];
  userIntentRevokePermission: string[];
}
