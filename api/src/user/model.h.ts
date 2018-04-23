import { AllowedUserGroupsByIntent } from "../authz/types";

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

export interface UserCreationResponse {
  id: string;
  displayName: string;
  organization: string;
}

export interface UserLoginResponse {
  id: string;
  displayName: string;
  organization: string;
  allowedIntents: string[];
  token: string;
}

export interface UserListResponse {
  items: UserListResponseItem[];
}

export interface UserListResponseItem {
  id: string;
  displayName: string;
  organization: string;
}

export interface UserAlreadyExistsError {
  kind: "UserAlreadyExists";
  targetUserId: string;
}

export interface AuthenticationError {
  kind: "AuthenticationError";
  userId: string;
}
