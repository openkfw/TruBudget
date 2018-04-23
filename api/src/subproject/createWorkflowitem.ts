import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent } from "../authz/types";
import {
  AuthenticatedRequest,
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined
} from "../httpd/lib";
import { isNonemptyString } from "../lib";
import { MultichainClient } from "../multichain/Client.h";
import * as Workflowitem from "../workflowitem";

const value = (name, val, isValid?) => {
  if (isValid !== undefined && !isValid(val)) {
    throwParseError([name]);
  }
  return val;
};

export const createWorkflowItem = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const body = req.body;

  if (body.apiVersion !== "1.0") throwParseError(["apiVersion"]);
  throwParseErrorIfUndefined(body, ["data"]);
  const data = body.data;

  await Workflowitem.create(
    multichain,
    req.token,
    getWorkflowitemDefaultPermissions(req.token),
    value("projectId", data.projectId, isNonemptyString),
    value("subprojectId", data.subprojectId, isNonemptyString),
    value("workflowitemId", data.workflowitemId, isNonemptyString),
    value("displayName", data.displayName, isNonemptyString),
    value("currency", data.currency, isNonemptyString),
    value("amountType", data.amountType, x => ["N/A", "disbursed", "allocated"].includes(x)),
    value("description", data.description, x => typeof x === "string"),
    value("status", data.status, x => ["open", "closed"].includes(x)),
    value("documents", data.documents), // not checked right now
    value("previousWorkflowitemId", data.previousWorkflowitemId) // optional
  );

  return [
    201,
    {
      apiVersion: "1.0",
      data: "Created."
    }
  ];
};

const getWorkflowitemDefaultPermissions = (token: AuthToken): AllowedUserGroupsByIntent => ({
  "workflowitem.permission.list": [token.userId],
  "workflowitem.permission.grant": [token.userId],
  "workflowitem.permission.revoke": [token.userId],
  "workflowitem.viewSummary": [token.userId],
  "workflowitem.viewDetails": [token.userId],
  "workflowitem.assign": [token.userId],
  "workflowitem.update": [token.userId],
  "workflowitem.close": [token.userId],
  "workflowitem.archive": [token.userId]
});
