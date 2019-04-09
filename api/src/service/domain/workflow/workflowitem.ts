import Joi = require("joi");

import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { canAssumeIdentity } from "../organization/auth_token";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import { StoredDocument } from "./document";
import * as Subproject from "./subproject";
import { WorkflowitemTraceEvent, workflowitemTraceEventSchema } from "./workflowitem_trace_event";

export type Id = string;

export const idSchema = Joi.string().max(32);

export interface Workflowitem {
  isRedacted: false;
  id: Id;
  subprojectId: Subproject.Id;
  createdAt: string;
  dueDate?: string;
  displayName: string;
  exchangeRate?: string;
  billingDate?: string;
  amount?: string;
  currency?: string;
  amountType: "N/A" | "disbursed" | "allocated";
  description: string;
  status: "open" | "closed";
  assignee?: string;
  documents: StoredDocument[];
  permissions: Permissions;
  log: WorkflowitemTraceEvent[];
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
}

export interface RedactedWorkflowitem {
  isRedacted: true;
  id: Id;
  subprojectId: Subproject.Id;
  createdAt: string;
  dueDate?: null;
  displayName: null;
  exchangeRate: null;
  billingDate?: null;
  amount?: null;
  currency?: null;
  amountType: null;
  description: null;
  status: "open" | "closed";
  assignee?: null;
  documents: [];
  permissions: {};
  log: WorkflowitemTraceEvent[];
  additionalData: {};
}

export type ScrubbedWorkflowitem = Workflowitem | RedactedWorkflowitem;

const schema = Joi.object().keys({
  isRedacted: Joi.boolean().required(),
  id: Joi.string().required(),
  subprojectId: Subproject.idSchema.required(),
  createdAt: Joi.date()
    .iso()
    .required(),
  dueDate: Joi.date().iso(),
  displayName: Joi.string().required(),
  exchangeRate: Joi.string()
    .when("amountType", {
      is: Joi.valid("disbursed", "allocated"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .when("status", {
      is: Joi.valid("closed"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .when("amountType", { is: Joi.valid("N/A"), then: Joi.forbidden() }),
  // TODO: we should also check the amount type
  billingDate: Joi.date()
    .iso()
    .when("amountType", {
      is: Joi.valid("N/A"),
      then: Joi.forbidden(),
    })
    .concat(
      Joi.date()
        .iso()
        .when("status", {
          is: Joi.valid("closed"),
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    ),
  amount: Joi.string()
    .when("amountType", {
      is: Joi.valid("disbursed", "allocated"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .when("status", { is: Joi.valid("closed"), then: Joi.required(), otherwise: Joi.optional() })
    .when("amountType", { is: Joi.valid("N/A"), then: Joi.forbidden() }),
  currency: Joi.string()
    .when("amountType", {
      is: Joi.valid("disbursed", "allocated"),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .when("status", { is: Joi.valid("closed"), then: Joi.required(), otherwise: Joi.optional() })
    .when("amountType", { is: Joi.valid("N/A"), then: Joi.forbidden() }),
  amountType: Joi.string()
    .valid("N/A", "disbursed", "allocated")
    .required(),
  description: Joi.string().allow(""),
  status: Joi.string()
    .valid("open", "closed")
    .required(),
  assignee: Joi.string(),
  documents: Joi.array()
    .required()
    .items(
      Joi.object().keys({
        id: Joi.string(),
        hash: Joi.string(),
      }),
    ),
  permissions: Joi.object()
    .pattern(/.*/, Joi.array().items(Joi.string()))
    .required(),
  log: Joi.array()
    .required()
    .items(workflowitemTraceEventSchema),
  additionalData: AdditionalData.schema.required(),
});

export function validate(input: any): Result.Type<Workflowitem> {
  const { error } = Joi.validate(input, schema);
  return error === null ? (input as Workflowitem) : error;
}

export function permits(
  workflowitem: Workflowitem,
  actingUser: ServiceUser,
  intents: Intent[],
): boolean {
  const eligibleIdentities: Identity[] = intents.reduce((acc: Identity[], intent: Intent) => {
    const eligibles = workflowitem.permissions[intent] || [];
    return acc.concat(eligibles);
  }, []);
  const hasPermission = eligibleIdentities.some(identity =>
    canAssumeIdentity(actingUser, identity),
  );
  return hasPermission;
}

export function redact(workflowitem: Workflowitem): RedactedWorkflowitem {
  return {
    isRedacted: true,
    id: workflowitem.id,
    subprojectId: workflowitem.subprojectId,
    createdAt: workflowitem.createdAt,
    dueDate: null,
    displayName: null,
    exchangeRate: null,
    billingDate: null,
    amount: null,
    currency: null,
    amountType: null,
    description: null,
    status: workflowitem.status,
    assignee: null,
    documents: [],
    permissions: {},
    log: redactLog(workflowitem.log),
    additionalData: {},
  };
}

function redactLog(events: WorkflowitemTraceEvent[]): WorkflowitemTraceEvent[] {
  return (
    events
      // We only keep close events for now:
      .filter(x => x.businessEvent.type === "workflowitem_closed")
      // We only keep the info needed to sort workflowitems:
      .map(x => ({
        entityId: x.entityId,
        entityType: x.entityType,
        businessEvent: {
          type: x.businessEvent.type,
          source: "REDACTED",
          time: x.businessEvent.time,
          publisher: "REDACTED",
        } as BusinessEvent,
        snapshot: {},
      }))
  );
}
