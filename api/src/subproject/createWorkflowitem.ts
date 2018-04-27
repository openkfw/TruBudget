import * as Subproject from ".";
import { throwIfUnauthorized } from "../authz/index";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent } from "../authz/types";
import {
  AuthenticatedRequest,
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined
} from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain/Client.h";
import { randomString } from "../multichain/hash";
import * as Workflowitem from "../workflowitem";

export const createWorkflowitem = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const body = req.body;

  if (body.apiVersion !== "1.0") throwParseError(["apiVersion"]);
  throwParseErrorIfUndefined(body, ["data"]);
  const data = body.data;

  const projectId = value("projectId", data.projectId, isNonemptyString);
  const subprojectId = value("subprojectId", data.subprojectId, isNonemptyString);

  // Is the user allowed to create workflowitems?
  await throwIfUnauthorized(
    req.token,
    "subproject.createWorkflowitem",
    await Subproject.getPermissions(multichain, projectId, subprojectId)
  );

  await Workflowitem.create(
    multichain,
    req.token,
    projectId,
    subprojectId,
    {
      id: isNonemptyString(data.workflowitemId) ? data.workflowitemId : randomString(),
      creationUnixTs: Date.now().toString(),
      displayName: value("displayName", data.displayName, isNonemptyString),
      amount: value("amount", data.amount, isNonemptyString),
      currency: value("currency", data.currency, isNonemptyString),
      amountType: value("amountType", data.amountType, x =>
        ["N/A", "disbursed", "allocated"].includes(x)
      ),
      description: value("description", data.description, x => typeof x === "string"),
      status: "open",
      documents: data.documents, // not checked right now
      previousWorkflowitemId: data.previousWorkflowitemId // optional
    },
    getWorkflowitemDefaultPermissions(req.token)
  );

  return [
    201,
    {
      apiVersion: "1.0",
      data: { created: true }
    }
  ];
};

const getWorkflowitemDefaultPermissions = (token: AuthToken): AllowedUserGroupsByIntent => {
  const intents: Intent[] = [
    "workflowitem.intent.listPermissions",
    "workflowitem.intent.grantPermission",
    "workflowitem.intent.revokePermission",
    "workflowitem.view",
    "workflowitem.assign",
    "workflowitem.update",
    "workflowitem.close",
    "workflowitem.archive"
  ];
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [token.userId] }), {});
};
