import { assert, expect } from "chai";
import * as Workflowitem from "../workflowitem/model/Workflowitem";
import { sortWorkflowitems } from "./sortWorkflowitems";

function mkWorkflowitem(id, data: any = {}, log: any = []) {
  const itemLog = log.map(x => ({
    key: id,
    intent: x.intent,
    createdBy: "jdoe",
    createdAt: x.createdAt,
    dataVersion: 1,
    data: x.data,
    // snapshot: {..}
  }));
  const amountType: "N/A" | "disbursed" | "allocated" = "N/A";
  const itemData = {
    id,
    creationUnixTs: data.creationUnixTs || "0",
    displayName: data.displayName || id,
    amountType,
    description: data.description || id,
    status: data.status || "open",
    documents: [],
    additionalData: {},
  };
  return {
    log: itemLog,
    allowedIntents: [],
    data: itemData,
  };
}

describe("sorting workflowitems", () => {
  it("puts closed items first, sorted by time of closing, not ctime, and ignoring the given ordering", async () => {
    const items: Workflowitem.WorkflowitemResource[] = [
      mkWorkflowitem("A", { creationUnixTs: "1", status: "open" }),
      mkWorkflowitem("B", { creationUnixTs: "2", status: "open" }),
      mkWorkflowitem("C", { creationUnixTs: "3", status: "open" }),
      mkWorkflowitem("D", { creationUnixTs: "4", status: "closed" }, [
        { intent: "workflowitem.close", createdAt: "2018-05-08T12:28:00.385Z" },
      ]),
      mkWorkflowitem("E", { creationUnixTs: "5", status: "closed" }, [
        { intent: "workflowitem.close", createdAt: "2018-05-08T11:28:00.385Z" },
      ]),
      mkWorkflowitem("F", { creationUnixTs: "6", status: "open" }),
    ];

    // ordering by ctime: [A, B, C, D, E, F]
    assert.isTrue(items[0].data.creationUnixTs < items[1].data.creationUnixTs);
    assert.isTrue(items[1].data.creationUnixTs < items[2].data.creationUnixTs);
    assert.isTrue(items[2].data.creationUnixTs < items[3].data.creationUnixTs);
    assert.isTrue(items[3].data.creationUnixTs < items[4].data.creationUnixTs);
    assert.isTrue(items[4].data.creationUnixTs < items[5].data.creationUnixTs);

    // Note that the ordering doesn't include A and B..
    const ordering = ["F", "C", "D", "E"];

    const sorted = sortWorkflowitems(items, ordering);

    // * The closed items are last in the ordering, but the ordering is not used for them.
    // * ctime(B) < ctime(C), but C closed first, so C before B
    // * ctime(A) < ctime(D), but ordering(A) > ordering(D), so D before A
    // * puts other items after closed and explicitly ordered ones, sorted by ctime

    expect(sorted[0].data.id).to.eq("E");
    expect(sorted[1].data.id).to.eq("D");
    expect(sorted[2].data.id).to.eq("F");
    expect(sorted[3].data.id).to.eq("C");
    expect(sorted[4].data.id).to.eq("A");
    expect(sorted[5].data.id).to.eq("B");
  });
});
