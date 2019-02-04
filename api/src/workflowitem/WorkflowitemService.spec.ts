import { assert } from "chai";

import { getAllScrubbedItems, ListReader, OrderingReader } from ".";
import Intent from "../authz/intents";
import { User } from "./User";
import { ScrubbedWorkflowitem, Workflowitem } from "./Workflowitem";

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
function newRedactedWorkflowitemFromWorkflowitem(item: Workflowitem): ScrubbedWorkflowitem {
  return {
    id: item.id,
    creationUnixTs: item.creationUnixTs,
    displayName: null,
    exchangeRate: null,
    billingDate: null,
    amount: null,
    currency: null,
    amountType: null,
    description: null,
    status: item.status,
    assignee: null,
    permissions: null,
    log: null,
    documents: null,
  };
}

describe("Listing workflowitems,", () => {
  it("redacts history events the user is not allowed to see.", async () => {
    const user: User = { id: "bob", groups: ["friends"] };

    const viewIntent: Intent = "workflowitem.view";
    const workflowitemVisibleToBob = newWorkflowitem("bobWorkflowitem", { [viewIntent]: ["bob"] });
    const workflowitemVisibleToFriends = newWorkflowitem("friendsWorkflowitem", {
      [viewIntent]: ["friends"],
    });
    const nonVisibleWorkflowitem: Workflowitem = newWorkflowitem("hiddenWorkflowitem", {});
    const redactedWorkflowitem: ScrubbedWorkflowitem = newRedactedWorkflowitemFromWorkflowitem(
      nonVisibleWorkflowitem,
    );

    const workflowitems = [
      workflowitemVisibleToBob,
      workflowitemVisibleToFriends,
      nonVisibleWorkflowitem,
    ];
    const ordering = [];

    const lister: ListReader = () => Promise.resolve(workflowitems);
    const orderingReader: OrderingReader = async () => ordering;

    const visibleWorkflowitems = await getAllScrubbedItems(user, {
      getAllWorkflowitems: lister,
      getWorkflowitemOrdering: orderingReader,
    });

    assert.equal(visibleWorkflowitems.length, 3);
    assert.equal(visibleWorkflowitems[0].id, "bobWorkflowitem");
    assert.equal(visibleWorkflowitems[1].id, "friendsWorkflowitem");
    assert.equal(visibleWorkflowitems[2].id, "hiddenWorkflowitem");
    assert.equal(JSON.stringify(visibleWorkflowitems[2]), JSON.stringify(redactedWorkflowitem));
  });
});
