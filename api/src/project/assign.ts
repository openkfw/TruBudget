import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import * as Project from "./model/Project";

export const assignProject = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);

  const userIntent: Intent = "project.assign";

  // Is the user allowed to (re-)assign a project?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Project.getPermissions(multichain, projectId),
  );

  const event = {
    intent: userIntent,
    createdBy: req.token.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { userId },
  };

  await Project.publish(multichain, projectId, event);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
