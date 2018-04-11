export interface User {
  id: string;
  displayName: string;
  organization: string;
  password: string;
}

export interface UserAlreadyExistsError {
  kind: "UserAlreadyExists";
  targetUserId: string;
}

export interface AuthenticationError {
  kind: "AuthenticationError";
  userId: string;
}
