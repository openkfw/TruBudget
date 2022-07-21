import Joi = require("joi");

import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { DocumentReference, documentReferenceSchema } from "../document/document";
import { canAssumeIdentity } from "../organization/auth_token";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import Type, { workflowitemTypeSchema } from "../workflowitem_types/types";
import { moneyAmountSchema } from "./money";
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
  rejectReason?: string;
  assignee: string;
  documents: DocumentReference[];
  permissions: Permissions;
  log: WorkflowitemTraceEvent[];
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
  workflowitemType?: Type;
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
  rejectReason?: string;
  assignee: null;
  documents: [];
  permissions: {};
  log: WorkflowitemTraceEvent[];
  additionalData: {};
  workflowitemType?: Type;
}

export type ScrubbedWorkflowitem = Workflowitem | RedactedWorkflowitem;

const schema = Joi.object().keys({
  isRedacted: Joi.boolean().required(),
  id: Joi.string().required(),
  subprojectId: Subproject.idSchema.required(),
  createdAt: Joi.date().iso().required(),
  dueDate: Joi.date().iso().allow(""),
  displayName: Joi.string().required(),
  // This should use exchangeRateSchema but can't, because of backward compatibility:
  exchangeRate: Joi.string().when("amountType", {
    is: "N/A",
    then: Joi.forbidden(),
    otherwise: Joi.when("status", {
      is: "closed",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),

  billingDate: Joi.date()
    .iso()
    .when("amountType", {
      is: Joi.valid("N/A"),
      then: Joi.forbidden(),
      otherwise: Joi.when("status", {
        is: "closed",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    }),

  amount: moneyAmountSchema.when("amountType", {
    is: Joi.valid("N/A"),
    then: Joi.forbidden(),
    otherwise: Joi.when("status", {
      is: "closed",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
  currency: Joi.string().when("amountType", {
    is: Joi.valid("N/A"),
    then: Joi.forbidden(),
    otherwise: Joi.when("status", {
      is: "closed",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
  amountType: Joi.string().valid("N/A", "disbursed", "allocated").required(),
  description: Joi.string().allow(""),
  status: Joi.string().valid("open", "closed").required(),
  rejectReason: Joi.string().optional(),
  assignee: Joi.string(),
  documents: Joi.array().required().items(documentReferenceSchema),
  permissions: Joi.object().pattern(/.*/, Joi.array().items(Joi.string())).required(),
  log: Joi.array().required().items(workflowitemTraceEventSchema),
  additionalData: AdditionalData.schema.required(),
  workflowitemType: workflowitemTypeSchema,
});

export function validate(input): Result.Type<Workflowitem> {
  const { error } = schema.validate(input);
  return error === undefined ? (input as Workflowitem) : error;
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
  const hasPermission = eligibleIdentities.some((identity) =>
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
    displayName: null,
    exchangeRate: null,
    billingDate: null,
    dueDate: null,
    amount: null,
    currency: null,
    amountType: null,
    description: null,
    status: workflowitem.status,
    rejectReason: workflowitem.rejectReason,
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
      .filter((x) => x.businessEvent.type === "workflowitem_closed")
      // We only keep the info needed to sort workflowitems:
      .map((x) => ({
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
