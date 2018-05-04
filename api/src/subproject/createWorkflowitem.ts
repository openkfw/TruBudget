import * as Subproject from ".";
import { throwIfUnauthorized } from "../authz/index";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent } from "../authz/types";
import {
  AuthenticatedRequest,
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined,
} from "../httpd/lib";
import { isNonemptyString, value, asyncValue, isUserOrUndefined } from "../lib";
import { MultichainClient } from "../multichain/Client.h";
import { randomString } from "../multichain/hash";
import * as Workflowitem from "../workflowitem";
import * as User from "../user";

export const createWorkflowitem = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
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
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  // If amountType is "N/A" (= not applicable), the amount and currency
  // fields are not expected. For other amountType values they're required.
  const amountType = value("amountType", data.amountType, x =>
    ["N/A", "disbursed", "allocated"].includes(x),
  );
  let amount;
  let currency;
  if (amountType === "N/A") {
    if (data.amount !== undefined || data.currency !== undefined) {
      throwParseError(["amountType", "amount", "currency"]);
    }
    amount = currency = undefined;
  } else {
    amount = value("amount", data.amount, isNonemptyString);
    currency = value("currency", data.currency, isNonemptyString);
  }

  await Workflowitem.create(
    multichain,
    req.token,
    projectId,
    subprojectId,
    {
      id: value("workflowitemId", data.workflowitemId, isNonemptyString, randomString()),
      creationUnixTs: Date.now().toString(),
      displayName: value("displayName", data.displayName, isNonemptyString),
      amount,
      currency,
      amountType,
      description: value("description", data.description, x => typeof x === "string", ""),
      status: value("status", data.status, x => ["open", "closed"].includes(x), "open"),
      assignee: await asyncValue("assignee", data.assignee, isUserOrUndefined),
      documents: data.documents, // not checked right now
      previousWorkflowitemId: data.previousWorkflowitemId, // optional
    },
    getWorkflowitemDefaultPermissions(req.token),
  );

  return [
    201,
    {
      apiVersion: "1.0",
      data: { created: true },
    },
  ];
};

const getWorkflowitemDefaultPermissions = (token: AuthToken): AllowedUserGroupsByIntent => {
  if (token.userId === "root") return {};

  const intents: Intent[] = [
    "workflowitem.intent.listPermissions",
    "workflowitem.intent.grantPermission",
    "workflowitem.intent.revokePermission",
    "workflowitem.view",
    "workflowitem.assign",
    "workflowitem.update",
    "workflowitem.close",
    "workflowitem.archive",
  ];
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [token.userId] }), {});
};
