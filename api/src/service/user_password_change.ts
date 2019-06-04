import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserPasswordChange from "./domain/organization/user_password_change";
import { hashPassword } from "./password";
import { store } from "./store";
import * as UserQuery from "./user_query";

export async function changeUserPassword(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: UserPasswordChange.RequestData,
): Promise<void> {
  const result = await UserPasswordChange.changeUserPassword(ctx, serviceUser, requestData, {
    getUser: () => UserQuery.getUser(conn, ctx, serviceUser, requestData.userId),
    hash: passwordPlainText => hashPassword(passwordPlainText),
  });
  if (Result.isErr(result)) return Promise.reject(result);

  for (const event of result) {
    await store(conn, ctx, event);
  }
}
