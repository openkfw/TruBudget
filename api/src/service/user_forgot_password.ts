import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { forgotPasswordDomain, RequestData } from "./domain/organization/user_forgot_password";
import * as UserQuery from "./domain/organization/user_query";
import { hashPassword } from "./password";
import { store } from "./store";

export async function forgotPassword(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  issuerOrganization: string,
  requestData: RequestData,
): Promise<Result.Type<void>> {
  logger.debug({ req: requestData }, "Changing user password");

  const newEventsResult = await forgotPasswordDomain(
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
    return new VError(newEventsResult, "failed to change password");
  }
  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }
}
