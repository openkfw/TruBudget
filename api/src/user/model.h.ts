export interface NewUser {
  id: string;
  displayName: string;
  organization: string;
  passwordPlaintext: string;
}

export interface UserRecord {
  id: string;
  displayName: string;
  organization: string;
  passwordCiphertext: string;
  allowedIntents: string[];
}

export interface UserCreationResponse {
  id: string;
  displayName: string;
  organization: string;
  allowedIntents: string[];
}

export interface UserLoginResponse {
  id: string;
  displayName: string;
  organization: string;
  allowedIntents: string[];
  token: string;
}

export interface UserListResponse {
  items: Array<UserListResponse>;
}

export interface UserListResponse {
  id: string;
  displayName: string;
  organization: string;
  allowedIntents: string[];
}

export interface UserAlreadyExistsError {
  kind: "UserAlreadyExists";
  targetUserId: string;
}

export interface AuthenticationError {
  kind: "AuthenticationError";
  userId: string;
}
