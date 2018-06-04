import { throwIfUnauthorized } from "../../authz/index";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { AllowedUserGroupsByIntent } from "../../authz/types";
import {
  AuthenticatedRequest,
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined,
} from "../../httpd/lib";
import { asyncValue, isNonemptyString, isUserOrUndefined, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain/Client.h";
import { randomString } from "../../multichain/hash";
import * as Workflowitem from "../../workflowitem/model/workflowitem";
import * as Subproject from "../model/Subproject";

const isUndefinedOrNull = x => x === undefined || x === null;

export async function createWorkflowitem(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const body = req.body;

  if (body.apiVersion !== "1.0") throwParseError(["apiVersion"]);
  throwParseErrorIfUndefined(body, ["data"]);
  const data = body.data;

  const projectId = value("projectId", data.projectId, isNonemptyString);
  const subprojectId = value("subprojectId", data.subprojectId, isNonemptyString);

  const userIntent: Intent = "subproject.createWorkflowitem";

  // Is the user allowed to create workflowitems?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  // Make sure the parent subproject is not already closed:
  if (await Subproject.isClosed(multichain, projectId, subprojectId)) {
    throw {
      kind: "PreconditionError",
      message: "Cannot add a workflowitem to a closed subproject.",
    };
  }

  // If amountType is "N/A" (= not applicable), the amount and currency
  // fields are not expected. For other amountType values they're required.
  const amountType = value("amountType", data.amountType, x =>
    ["N/A", "disbursed", "allocated"].includes(x),
  );
  let amount;
  let currency;
  if (amountType === "N/A") {
    if (!isUndefinedOrNull(data.amount) || !isUndefinedOrNull(data.currency)) {
      throwParseError(
        ["amountType", "amount", "currency"],
        'If the amountType is "N/A" (= not applicable), the fields "amount" and "currency" must not be present.',
      );
    }
    amount = currency = undefined;
  } else {
    amount = value("amount", data.amount, isNonemptyString);
    currency = value("currency", data.currency, isNonemptyString);
  }

  // A user may add open workflowitems any time, but closed ones must not be preceded by open ones:
  const status = value("status", data.status, x => ["open", "closed"].includes(x), "open");
  if (status === "closed") {
    if (!(await Workflowitem.areAllClosed(multichain, projectId, subprojectId))) {
      throw {
        kind: "PreconditionError",
        message: "Cannot add a closed workflowitem after a non-closed workflowitem.",
      };
    }
  }

  const workflowitemId = value(
    "workflowitemId",
    data.workflowitemId,
    isNonemptyString,
    randomString(),
  );

  const ctime = new Date();

  const workflowitem: Workflowitem.Data = {
    id: workflowitemId,
    creationUnixTs: ctime.getTime().toString(),
    displayName: value("displayName", data.displayName, isNonemptyString),
    amount,
    currency,
    amountType,
    description: value("description", data.description, x => typeof x === "string", ""),
    status,
    assignee: await asyncValue("assignee", data.assignee, isUserOrUndefined, req.token.userId),
    documents: data.documents, // not checked right now
  };

  const event = {
    intent: userIntent,
    createdBy: req.token.userId,
    creationTimestamp: ctime,
    dataVersion: 1,
    data: {
      workflowitem,
      permissions: getWorkflowitemDefaultPermissions(req.token),
    },
  };

  await Workflowitem.publish(multichain, projectId, subprojectId, workflowitemId, event);

  return [
    201,
    {
      apiVersion: "1.0",
      data: { created: true },
    },
  ];
}

function getWorkflowitemDefaultPermissions(token: AuthToken): AllowedUserGroupsByIntent {
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
}
