import { VError } from "verror";
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
  issuerOrganization: string,
  requestData: UserPasswordChange.RequestData,
): Promise<Result.Type<void>> {
  const newEventsResult = await UserPasswordChange.changeUserPassword(
    ctx,
    serviceUser,
    issuerOrganization,
    requestData,
    {
      getUser: () => UserQuery.getUser(conn, ctx, serviceUser, requestData.userId),
      hash: (passwordPlainText) => hashPassword(passwordPlainText),
    },
  );
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, `failed to change password`);
  }
  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
