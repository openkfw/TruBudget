import { Identity } from "../organization/identity";
import { ProjectTraceEvent } from "./project_trace_event";
import { SubprojectTraceEvent } from "./subproject_trace_event";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";

interface FilterBase {
  publisher?: Identity;
  startAt?: string; // ISO timestamp;
  endAt?: string; // ISO timestamp;
  eventType?: string;
}

type TraceEvent = ProjectTraceEvent | SubprojectTraceEvent | WorkflowitemTraceEvent;

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Filter = RequireAtLeastOne<FilterBase, "publisher" | "startAt" | "endAt" | "eventType">;

export const filterTraceEvents = <T extends TraceEvent>(traceEvents: T[], filter: Filter): T[] => {
  if (filter.publisher) {
    // Publisher id must match exactly
    traceEvents = traceEvents.filter((event) => event.businessEvent.publisher === filter.publisher);
  }

  if (filter.startAt) {
    const startAt = filter.startAt;
    traceEvents = traceEvents.filter(
      (event) => new Date(event.businessEvent.time) >= new Date(startAt),
    );
  }

  if (filter.endAt) {
    const endAt = filter.endAt;
    traceEvents = traceEvents.filter(
      (event) => new Date(event.businessEvent.time) <= new Date(endAt),
    );
  }

  if (filter.eventType) {
    // Event type must match exactly
    traceEvents = traceEvents.filter((event) => event.businessEvent.type === filter.eventType);
  }
  return traceEvents;
};
