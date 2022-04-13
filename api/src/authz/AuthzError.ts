import { AuthToken } from "./token";
import { NotAuthorizedError } from "./types";

export class AuthzError extends Error {
  private token: AuthToken;

  private intent: string;

  constructor(msg: NotAuthorizedError) {
    const { token, intent } = msg;
    super("Faile to authenticate!");
    this.token = token;
    this.intent = intent;
  }
}
