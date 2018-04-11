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
}

export interface UserLoginResponse {
  id: string;
  displayName: string;
  organization: string;
  token: string;
}

export interface UserAlreadyExistsError {
  kind: "UserAlreadyExists";
  targetUserId: string;
}

export interface AuthenticationError {
  kind: "AuthenticationError";
  userId: string;
}
