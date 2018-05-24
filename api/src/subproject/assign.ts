import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import * as Subproject from "./model/Subproject";
import { createNotification } from "../notification/create";

export const assignSubproject = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);

  const userIntent: Intent = "subproject.assign";

  // Is the user allowed to (re-)assign a subproject?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  const event = {
    intent: userIntent,
    createdBy: req.token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { userId },
  };

  await Subproject.publish(multichain, projectId, subprojectId, event);

  // If the subproject has been assigned to someone else, that person is notified about the change:
  const subproject = await Subproject.get(multichain, req.token, projectId, subprojectId).then(
    x => x[0],
  );
  if (subproject.data.assignee !== undefined && subproject.data.assignee !== req.token.userId) {
    await createNotification(
      multichain,
      subprojectId,
      "subproject",
      req.token.userId,
      subproject.data.assignee,
    );
  }

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
