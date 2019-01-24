import { assert } from "chai";

import { getAllScrubbedItems, ListReader } from ".";
import { OrderingReader } from ".";
import Intent from "../authz/intents";
import { User } from "./User";
import { Workflowitem } from "./Workflowitem";

function newWorkflowitem(id: string, permissions: object): Workflowitem {
  return {
    id,
    displayName: "Abcd",
    creationUnixTs: `${new Date().getTime()}`,
    status: "open",
    exchangeRate: "1.0",
    billingDate: `${new Date().getTime()}`,
    amount: "100",
    currency: "EUR",
    amountType: "disbursed",
    description: "Abcd",
    assignee: "Testuser",
    documents: [{ id: "abc", hash: "def" }],
    permissions,
    log: [],
  };
}

describe("When listing workflowitems,", () => {
  it("filters the list of workflowitems according to the user's permissions.", async () => {
    const user: User = { id: "bob", groups: ["friends"] };

    const viewIntent: Intent = "workflowitem.view";
    const workflowitemVisibleToBob = newWorkflowitem("bobWorkflowitem", { [viewIntent]: ["bob"] });
    const workflowitemVisibleToFriends = newWorkflowitem("friendsWorkflowitem", {
      [viewIntent]: ["friends"],
    });
    const nonVisibleWorkflowitem = newWorkflowitem("hiddenWorkflowitem", {});

    const workflowitems = [
      workflowitemVisibleToBob,
      workflowitemVisibleToFriends,
      nonVisibleWorkflowitem,
    ];
    const ordering = [];

    const lister: ListReader = () => Promise.resolve(workflowitems);
    const orderingReader: OrderingReader = () => Promise.resolve(ordering);

    const visibleWorkflowitems = await getAllScrubbedItems(user, {
      getAllWorkflowitems: lister,
      getWorkflowitemOrdering: orderingReader,
    });

    assert.equal(visibleWorkflowitems.length, 3);
    assert.equal(visibleWorkflowitems[0].id, "bobWorkflowitem");
    assert.equal(visibleWorkflowitems[1].id, "friendsWorkflowitem");
    assert.equal(visibleWorkflowitems[2].id, "hiddenWorkflowitem");
  });
});
