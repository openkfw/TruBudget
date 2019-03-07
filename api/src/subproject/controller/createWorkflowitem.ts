import * as crypto from "crypto";
import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { Permissions } from "../../authz/types";
import { HttpResponse, throwParseError, throwParseErrorIfUndefined } from "../../httpd/lib";
import logger from "../../lib/logger";
import {
  asyncValue,
  isDate,
  isNonemptyString,
  isNumber,
  isUserOrUndefined,
  value,
  isObject,
} from "../../lib/validation";
import { MultichainClient } from "../../service/Client.h";
import { randomString } from "../../service/hash";
import * as Workflowitem from "../../workflowitem/model/Workflowitem";
import { Document } from "../../workflowitem/model/Workflowitem";
import * as Subproject from "../model/Subproject";

const isUndefinedOrNull = x => x === undefined || x === null;

interface DocumentDto {
  id: string;
  base64: string;
}

export async function hashBase64String(base64String: string): Promise<string> {
  return new Promise<string>(resolve => {
    const hash = crypto.createHash("sha256");
    hash.update(Buffer.from(base64String, "base64"));
    resolve(hash.digest("hex"));
  });
}

export async function hashDocuments(docs): Promise<Document[]> {
  return await Promise.all<Document>(
    docs.map(
      (document): Promise<Document> => {
        return hashBase64String(document.base64).then(hashValue => ({
          id: document.id,
          hash: hashValue,
        }));
      },
    ),
  );
}

export async function createWorkflowitem(multichain: MultichainClient, req): Promise<HttpResponse> {
  const body = req.body;

  if (body.apiVersion !== "1.0") throwParseError(["apiVersion"]);
  throwParseErrorIfUndefined(body, ["data"]);
  const data = body.data;

  const projectId = value("projectId", data.projectId, isNonemptyString);
  const subprojectId = value("subprojectId", data.subprojectId, isNonemptyString);

  const userIntent: Intent = "subproject.createWorkflowitem";

  // Is the user allowed to create workflowitems?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  // Make sure the parent subproject is not already closed:
  if (await Subproject.isClosed(multichain, projectId, subprojectId)) {
    const message = "Cannot add a workflowitem to a closed subproject.";
    logger.debug({ error: { multichain, projectId, subprojectId } }, message);
    throw {
      kind: "PreconditionError",
      message,
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
      const message = "Cannot add a closed workflowitem after a non-closed workflowitem.";
      logger.debug({ error: { multichain, projectId, subprojectId } }, message);
      throw {
        kind: "PreconditionError",
        message,
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
  const defaultBillingDate = new Date(ctime);
  defaultBillingDate.setUTCHours(0);
  defaultBillingDate.setUTCMinutes(0);
  defaultBillingDate.setUTCSeconds(0);
  defaultBillingDate.setUTCMilliseconds(0);

  const workflowitem: Workflowitem.Data = {
    id: workflowitemId,
    creationUnixTs: ctime.getTime().toString(),
    displayName: value("displayName", data.displayName, isNonemptyString),
    amount,
    currency,
    amountType,
    description: value("description", data.description, x => typeof x === "string", ""),
    status,
    exchangeRate: value(
      "exchangeRate",
      data.exchangeRate,
      x => isNonemptyString(x) && isNumber(x),
      "1.0",
    ),

    billingDate: value(
      "billingDate",
      data.billingDate,
      x => isNonemptyString(x) && isDate(x),
      defaultBillingDate.toISOString(),
    ),

    assignee: await asyncValue(
      multichain,
      "assignee",
      data.assignee,
      isUserOrUndefined,
      req.user.userId,
    ),
    documents: data.documents !== undefined ? await hashDocuments(data.documents) : [],

    additionalData: value("additionalData", data.additionalData, isObject, {}),
  };

  const event = {
    intent: userIntent,
    createdBy: req.user.userId,
    creationTimestamp: ctime,
    dataVersion: 1,
    data: {
      workflowitem,
      permissions: getWorkflowitemDefaultPermissions(req.user),
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

function getWorkflowitemDefaultPermissions(token: AuthToken): Permissions {
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
