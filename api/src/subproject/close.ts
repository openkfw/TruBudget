import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { Event } from "../multichain/event";
import * as Workflowitem from "../workflowitem";
import { notifySubprojectAssignee } from "./lib/notifySubprojectAssignee";
import * as Subproject from "./model/Subproject";

export const closeSubproject = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const userIntent: Intent = "subproject.close";

  // Is the user allowed to close a subproject?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  // All assiciated workflowitems need to be closed:
  if (!(await Workflowitem.areAllClosed(multichain, projectId, subprojectId))) {
    throw {
      kind: "PreconditionError",
      message:
        "Cannot close a subproject if at least one associated workflowitem is not yet closed.",
    };
  }

  const publishedEvent = await sendEventToDatabase(
    multichain,
    req.token,
    userIntent,
    projectId,
    subprojectId,
  );

  await notifySubprojectAssignee(multichain, req.token, projectId, subprojectId, publishedEvent);

  return [200, { apiVersion: "1.0", data: "OK" }];
};

async function sendEventToDatabase(
  multichain: MultichainClient,
  token: AuthToken,
  userIntent: Intent,
  projectId: string,
  subprojectId: string,
): Promise<Event> {
  const event = {
    intent: userIntent,
    createdBy: token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: {},
  };
  const publishedEvent = await Subproject.publish(multichain, projectId, subprojectId, event);
  return publishedEvent;
}
