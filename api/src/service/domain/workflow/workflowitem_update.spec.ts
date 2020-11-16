import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { hashDocument, StoredDocument } from "./document";
import { Workflowitem } from "./workflowitem";
import { updateWorkflowitem } from "./workflowitem_update";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy-workflowitem";
const baseWorkflowitem: Workflowitem = {
  isRedacted: false,
  id: workflowitemId,
  subprojectId,
  createdAt: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  status: "open",
  displayName: "dummy",
  description: "dummy",
  amountType: "N/A",
  documents: [],
  permissions: { "workflowitem.update": [alice, bob, charlie].map((x) => x.id) },
  log: [],
  additionalData: {},
  assignee: alice.id,
  workflowitemType: "general",
};

const stripOutDocumentId = (docs: StoredDocument[]) => {
  return docs.map((d) => ({ id: d.id, hash: d.hash }));
};

const baseRepository = {
  applyWorkflowitemType: () => [],
  getUsersForIdentity: async (identity) => {
    if (identity === "alice") return ["alice"];
    if (identity === "bob") return ["bob"];
    if (identity === "charlie") return ["charlie"];
    if (identity === "alice_and_bob") return ["alice", "bob"];
    if (identity === "alice_and_bob_and_charlie") return ["alice", "bob", "charlie"];
    if (identity === "root") return ["root"];
    throw Error(`unexpected identity: ${identity}`);
  },
};

describe("update workflowitem: authorization", () => {
  it("Without the workflowitem.update permission, a user cannot update a workflowitem", async () => {
    const modification = {};
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          permissions: {},
        }),
      },
    );
    assert.instanceOf(result, NotAuthorized);
  });

  it("The root user doesn't need permission to update a workflowitem", async () => {
    const modification = {};
    const result = await updateWorkflowitem(
      ctx,
      root,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          permissions: {},
        }),
      },
    );
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});

describe("update workflowitem: how modifications are applied", () => {
  it("An empty update is ignored", async () => {
    const modification = {};
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
        }),
      },
    );

    // It works:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { newEvents } = Result.unwrap(result);

    // But there are no new events:
    assert.lengthOf(newEvents, 0);
  });

  it("An update that contains current values only is ignored", async () => {
    const modification = {
      displayName: "Foo",
      description: "A description.",
      dueDate: baseWorkflowitem.dueDate,
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          displayName: "Foo",
          description: "A description.",
          dueDate: baseWorkflowitem.dueDate,
        }),
      },
    );

    // It works:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { newEvents } = Result.unwrap(result);

    // But there are no new events:
    assert.lengthOf(newEvents, 0);
  });

  it("The description field can be cleared as an empty string is allowed there", async () => {
    const modification = {
      description: "",
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          displayName: "Foo",
          description: "A description.",
        }),
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { newEvents, workflowitem } = Result.unwrap(result);

    // There are new events and the workflowitem's description has been cleared:
    assert.isAtLeast(newEvents.length, 1);
    assert.equal(workflowitem.description, "");
  });

  it("The displayName field cannot be cleared as it is a required field", async () => {
    const modification = {
      displayName: "",
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          displayName: "Foo",
          description: "A description.",
        }),
      },
    );

    assert.isTrue(Result.isErr(result));
    const error = Result.unwrap_err(result);
    assert.match(error.message, /displayName.*\s+.*empty/);
  });

  it("The due date field can be deleted", async () => {
    const modification = {
      dueDate: undefined,
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          dueDate: undefined,
        }),
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { newEvents, workflowitem } = Result.unwrap(result);

    // The workflowitem's dueDate has been set:
    assert.equal(workflowitem.dueDate, undefined);
    assert.lengthOf(newEvents, 1);
  });

  it("A closed workflowitem cannot be updated", async () => {
    const modification = {
      description: "Some update",
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          status: "closed",
          billingDate: "2019-03-20T10:33:18.856Z",
          description: "A description.",
        }),
      },
    );

    assert.isTrue(Result.isErr(result));
    const error = Result.unwrap_err(result);
    assert.match(error.message, /status/);
  });

  it(
    "A workflowitem's amount, currency and exchangeRate fields " +
      'are cleared if the amountType is set to "N/A" by the update',
    async () => {
      const modification = {
        amountType: "N/A" as "N/A",
      };
      const result = await updateWorkflowitem(
        ctx,
        alice,
        projectId,
        subprojectId,
        workflowitemId,
        modification,
        {
          ...baseRepository,
          getWorkflowitem: async (_workflowitemId) => ({
            ...baseWorkflowitem,
            amountType: "disbursed",
            amount: "123",
            currency: "EUR",
            exchangeRate: "1.234",
          }),
        },
      );

      // It works:
      assert.isTrue(Result.isOk(result), (result as Error).message);
      const { workflowitem } = Result.unwrap(result);

      // Setting the amount type to "N/A" has removed contradicting fields:
      assert.isUndefined(workflowitem.amount);
      assert.isUndefined(workflowitem.currency);
      assert.isUndefined(workflowitem.exchangeRate);
    },
  );

  it(
    "Updates to a workflowitem's amount, currency and exchangeRate fields " +
      'are forbidden if the amountType is already set to "N/A"',
    async () => {
      const modification = {
        amount: "123",
        currency: "EUR",
        exchangeRate: "1.234",
      };
      const result = await updateWorkflowitem(
        ctx,
        alice,
        projectId,
        subprojectId,
        workflowitemId,
        modification,
        {
          ...baseRepository,
          getWorkflowitem: async (_workflowitemId) => ({
            ...baseWorkflowitem,
            amountType: "N/A",
          }),
        },
      );

      assert.isTrue(Result.isErr(result));
    },
  );

  it("Updating documents with an empty list doesn't change existing documents", async () => {
    const modification = {
      documents: [],
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          documents: [{ id: "a", hash: "hashA", documentId: "abc" }],
        }),
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { workflowitem } = Result.unwrap(result);
    assert.deepEqual(workflowitem.documents, [{ id: "a", hash: "hashA", documentId: "abc" }]);
  });

  it("An update to documents adds new documents", async () => {
    const modification = {
      documents: [
        { id: "B", base64: "abc", fileName: "test.pdf" },
        { id: "C", base64: "cde", fileName: "test.pdf" },
      ],
    };

    const expectedHashForB = Result.unwrap(await hashDocument(modification.documents[0])).hash;
    const expectedHashForC = Result.unwrap(await hashDocument(modification.documents[1])).hash;
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          documents: [{ id: "A", hash: "hash for A", documentId: "abc" }],
        }),
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { workflowitem } = Result.unwrap(result);
    assert.sameDeepMembers(
      stripOutDocumentId(workflowitem.documents),
      stripOutDocumentId([
        { id: "A", hash: "hash for A", documentId: "abc1" },
        { id: "B", hash: expectedHashForB, documentId: "abc2" },
        { id: "C", hash: expectedHashForC, documentId: "abc3" },
      ]),
    );
  });

  it("An update to existing documents is ignored if the update doesn't change the documents' hashes", async () => {
    const modification = {
      documents: [{ id: "A", base64: "abc", fileName: "test.pdf" }],
    };

    const hashForDocumentA = Result.unwrap(await hashDocument(modification.documents[0])).hash;
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          documents: [{ id: "A", hash: hashForDocumentA, documentId: "abc" }],
        }),
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { workflowitem } = Result.unwrap(result);
    assert.sameDeepMembers(
      stripOutDocumentId(workflowitem.documents),
      stripOutDocumentId([{ id: "A", hash: hashForDocumentA, documentId: "abc" }]),
    );
  });

  it("An update to existing documents fails if the update would change the documents' hashes", async () => {
    const modification = {
      documents: [{ id: "A", base64: "", fileName: "test.pdf" }],
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          documents: [{ id: "A", hash: "old hash for A", documentId: "abc" }],
        }),
      },
    );

    assert.isTrue(Result.isErr(result));
  });

  it("An update to additional data adds new items and replaces existing ones", async () => {
    const modification = {
      additionalData: {
        a: "updated value",
        b: "new value",
      },
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          additionalData: {
            a: "old value",
          },
        }),
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { workflowitem } = Result.unwrap(result);
    assert.deepEqual(workflowitem.additionalData, {
      a: "updated value",
      b: "new value",
    });
  });

  it("Updating fails for an invalid workflowitem ID", async () => {
    const modification = {
      description: "Some update",
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => new Error("some error"),
      },
    );

    // NotFound error as the workflowitem cannot be fetched:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});

describe("update workflowitem: notifications", () => {
  it("When a user updates an assigned workflowitem, a notification is issued to the assignee", async () => {
    const modification = {
      description: "New description.",
    };
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
          description: "A description.",
          assignee: bob.id,
        }),
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { newEvents } = Result.unwrap(result);

    assert.isTrue(
      newEvents.some(
        (event) => event.type === "notification_created" && event.recipient === bob.id,
      ),
    );
  });

  it("When an update is ignored, no notifications are issued", async () => {
    // An empty modification is always ignored:
    const modification = {};
    const result = await updateWorkflowitem(
      ctx,
      alice,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        ...baseRepository,
        getWorkflowitem: async (_workflowitemId) => ({
          ...baseWorkflowitem,
        }),
      },
    );

    // It works:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { newEvents } = Result.unwrap(result);

    // But no notifications have been issued (in fact there are no new events at all):
    assert.lengthOf(newEvents, 0);
  });

  it(
    "When a user updates a workflowitem that is assigned to a group, " +
      "each member, except for the user that invoked the update, receives a notification",
    async () => {
      const modification = {
        description: "New description.",
      };
      const result = await updateWorkflowitem(
        ctx,
        alice,
        projectId,
        subprojectId,
        workflowitemId,
        modification,
        {
          ...baseRepository,
          getWorkflowitem: async (_workflowitemId) => ({
            ...baseWorkflowitem,
            description: "A description.",
            assignee: "alice_and_bob_and_charlie",
          }),
        },
      );

      assert.isTrue(Result.isOk(result), (result as Error).message);
      const { newEvents } = Result.unwrap(result);

      // A notification has been issued to both Bob and Charlie, but not to Alice, as she
      // is the user who has updated the workflowitem:
      function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
        return (event) => event.type === "notification_created" && event.recipient === userId;
      }

      assert.isFalse(newEvents.some(isNotificationFor("alice")));
      assert.isTrue(newEvents.some(isNotificationFor("bob")));
      assert.isTrue(newEvents.some(isNotificationFor("charlie")));
    },
  );
});
