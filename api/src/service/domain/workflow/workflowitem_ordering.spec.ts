import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemClosed from "./workflowitem_closed";
import { sortWorkflowitems } from "./workflowitem_ordering";
import { WorkflowitemTraceEvent } from "./workflowitem_trace_event";

const OPEN = "open" as "open";
const CLOSED = "closed" as "closed";

const ctx: Ctx = { requestId: "", source: "test" };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy-workflowitem";
const baseWorkflowitem: Workflowitem.Workflowitem = {
  isRedacted: false,
  id: workflowitemId,
  subprojectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: "dummy",
  description: "dummy",
  amountType: "N/A",
  documents: [],
  permissions: {},
  assignee: alice.id,
  log: [],
  additionalData: {},
  workflowitemType: "general",
};
const baseRedactedItem: Workflowitem.RedactedWorkflowitem = {
  isRedacted: true,
  id: workflowitemId,
  subprojectId,
  createdAt: new Date().toISOString(),
  displayName: null,
  exchangeRate: null,
  billingDate: null,
  dueDate: null,
  amount: null,
  currency: null,
  amountType: null,
  description: null,
  status: "open",
  assignee: null,
  documents: [],
  permissions: {},
  log: [],
  additionalData: {},
  workflowitemType: "general",
};

describe("reorder workflowitem", () => {
  it("With an empty ordering, items are sorted by their creation time", async () => {
    const a = { ...baseWorkflowitem, id: "a", status: OPEN, createdAt: "2019-01-01T01:00:00.000Z" };
    const b = { ...baseWorkflowitem, id: "b", status: OPEN, createdAt: "2019-01-01T02:00:00.000Z" };
    const c = { ...baseWorkflowitem, id: "c", status: OPEN, createdAt: "2019-01-01T03:00:00.000Z" };

    const items = [c, b, a];
    const ordering = [];

    const sorted = sortWorkflowitems(items, ordering);

    assert.deepEqual(
      sorted.map((x) => x.id),
      ["a", "b", "c"],
    );
  });

  it(
    "With an non-empty ordering, items that occur in the ordering are sorted accordingly " +
      "and come before those not included in the ordering",
    async () => {
      const a = {
        ...baseWorkflowitem,
        id: "a",
        status: OPEN,
        createdAt: "2019-01-01T01:00:00.000Z",
      };
      const b = {
        ...baseWorkflowitem,
        id: "b",
        status: OPEN,
        createdAt: "2019-01-01T02:00:00.000Z",
      };
      const c = {
        ...baseWorkflowitem,
        id: "c",
        status: OPEN,
        createdAt: "2019-01-01T03:00:00.000Z",
      };
      const d = {
        ...baseWorkflowitem,
        id: "d",
        status: OPEN,
        createdAt: "2019-01-01T04:00:00.000Z",
      };

      const items = [d, c, b, a];
      const ordering = [b, c].map((x) => x.id);

      const sorted = sortWorkflowitems(items, ordering);

      assert.deepEqual(
        sorted.map((x) => x.id),
        ["b", "c", "a", "d"],
      );
    },
  );

  it(
    "Closed items are always sorted by the timestamp of their closed-event and put first " +
      "in the ordering, before all non-closed items",
    async () => {
      const a = {
        ...baseWorkflowitem,
        id: "a",
        status: OPEN,
        createdAt: "2019-01-01T01:00:00.000Z",
      };
      const b = {
        ...baseWorkflowitem,
        id: "b",
        status: CLOSED,
        createdAt: "2019-01-01T02:00:00.000Z",
        log: [
          newTraceEvent(
            "b",
            Result.unwrap(
              WorkflowitemClosed.createEvent(
                ctx.source,
                alice.id,
                projectId,
                subprojectId,
                "b",
                "2019-01-01T14:00:00.000Z",
              ),
            ),
          ),
        ],
      };
      const c = {
        ...baseWorkflowitem,
        id: "c",
        status: OPEN,
        createdAt: "2019-01-01T03:00:00.000Z",
      };
      const d = {
        ...baseWorkflowitem,
        id: "d",
        status: CLOSED,
        createdAt: "2019-01-01T04:00:00.000Z",
        log: [
          newTraceEvent(
            "d",
            Result.unwrap(
              WorkflowitemClosed.createEvent(
                ctx.source,
                alice.id,
                projectId,
                subprojectId,
                "d",
                // b is created before d, but d is closed earlier:
                "2019-01-01T13:00:00.000Z",
              ),
            ),
          ),
        ],
      };
      const e = {
        ...baseWorkflowitem,
        id: "e",
        status: OPEN,
        // Actually the first item created, but not closed and not mentioned in the ordering:
        createdAt: "2019-01-01T00:00:00.000Z",
      };

      const items = [b, a, d, c, e];
      const ordering = [c, a].map((x) => x.id);

      const sorted = sortWorkflowitems(items, ordering);

      // 1. d, which is the first closed item
      // 2. b, which is the other closed item
      // 3. c, which is open and first in the ordering
      // 4. a, which is open and second in the ordering
      // 5. e, which is open and not mentioned in the ordering
      assert.deepEqual(
        sorted.map((x) => x.id),
        ["d", "b", "c", "a", "e"],
      );
    },
  );

  it("Workflowitems are sorted the same way, regardless whether they're redacted or not", async () => {
    const a = {
      ...baseRedactedItem,
      id: "a",
      status: OPEN,
      createdAt: "2019-01-01T01:00:00.000Z",
    };
    const b = {
      ...baseRedactedItem,
      id: "b",
      status: CLOSED,
      createdAt: "2019-01-01T02:00:00.000Z",
      log: [
        newTraceEvent(
          "b",
          Result.unwrap(
            WorkflowitemClosed.createEvent(
              ctx.source,
              alice.id,
              projectId,
              subprojectId,
              "b",
              "2019-01-01T14:00:00.000Z",
            ),
          ),
        ),
      ],
    };
    const c: Workflowitem.RedactedWorkflowitem = {
      ...baseRedactedItem,
      id: "c",
      status: OPEN,
      createdAt: "2019-01-01T03:00:00.000Z",
    };

    const items = [a, b, c];
    const ordering = [c].map((x) => x.id);

    const sorted = sortWorkflowitems(items, ordering);

    // 1. b, which is the only closed item
    // 2. c, which is mentioned in the ordering
    // 3. a, which is the first item created, but not mentioned in the ordering
    assert.deepEqual(
      sorted.map((x) => x.id),
      ["b", "c", "a"],
    );
  });
});

function newTraceEvent(id: string, event: BusinessEvent): WorkflowitemTraceEvent {
  return {
    entityId: id,
    entityType: "workflowitem",
    businessEvent: event,
    snapshot: {
      displayName: "not set",
      amount: "not set",
      currency: "not set",
      amountType: "not set",
    },
  };
}
