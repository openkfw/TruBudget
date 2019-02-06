import { assert } from "chai";

import {
  close,
  CloseNotifier,
  Closer,
  getAllScrubbedItems,
  ListReader,
  OrderingReader,
  update,
  UpdateNotifier,
  Updater,
} from ".";
import Intent from "../authz/intents";
import { assertIsRejectedWith, assertIsResolved } from "../lib/test/promise";
import { User } from "./User";
import { ScrubbedWorkflowitem, Update, Workflowitem } from "./Workflowitem";

const updateIntent: Intent = "workflowitem.update";
const viewIntent: Intent = "workflowitem.view";
const closeIntent: Intent = "workflowitem.close";

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
  });
});

describe("Closing a project", () => {
  const alice: User = { id: "alice", groups: ["otherfriends"] };
  const bob: User = { id: "bob", groups: ["friends"] };
  const notifier: CloseNotifier = _workflowitem => Promise.resolve();

  it("requires specific permissions", async () => {
    const workflowitemIds: string[] = [
      "bobWorkflowitem",
      "friendsWorkflowitem",
      "nonClosableWorkflowitem",
    ];
    const workflowitemClosableByBob = newWorkflowitem(workflowitemIds[0], {
      [closeIntent]: ["bob"],
      [viewIntent]: ["bob"],
    });
    const workflowitemClosableByFriends = newWorkflowitem(workflowitemIds[1], {
      [closeIntent]: ["friends"],
      [viewIntent]: ["friends"],
    });
    const notClosableByBob = newWorkflowitem(workflowitemIds[2], {
      [closeIntent]: ["alice"],
    });

    const workflowitems = [
      workflowitemClosableByBob,
      workflowitemClosableByFriends,
      notClosableByBob,
    ];

    const projectForTesting = "ProjectA";
    const subprojectForTesting = "SubrojectA";

    const ordering = [
      workflowitemClosableByBob.id,
      workflowitemClosableByFriends.id,
      notClosableByBob.id,
    ];

    const getOrdering: OrderingReader = () => Promise.resolve(ordering);
    const getWorkflowitems: ListReader = () => Promise.resolve(workflowitems);
    const closeWorkflowitem: Closer = async workflowitemId => {
      if (!workflowitemIds.includes(workflowitemId)) {
        return Promise.reject("Incorrect requirements");
      }
      return;
    };
    const notify: CloseNotifier = async (workflowitemId, _actingUser) => {
      if (!workflowitemIds.includes(workflowitemId.id)) {
        return Promise.reject("Incorrect requirements");
      }
      return;
    };

    await assertIsResolved(
      close(bob, workflowitemIds[0], {
        getOrdering,
        getWorkflowitems,
        closeWorkflowitem,
        notify,
      }),
    );
    workflowitemClosableByBob.status = "closed";
    await assertIsResolved(
      close(bob, workflowitemIds[1], {
        getOrdering,
        getWorkflowitems,
        closeWorkflowitem,
        notify,
      }),
    );
    workflowitemClosableByFriends.status = "closed";
    await assertIsRejectedWith(
      close(bob, workflowitemIds[3], {
        getOrdering,
        getWorkflowitems,
        closeWorkflowitem,
        notify,
      }),
    );
  });
  it("fails if not all previous workflowitems are closed", async () => {
    const workflowitemClosableByBob = newWorkflowitem("bobWorkflowitem", {
      [closeIntent]: ["bob"],
      [viewIntent]: ["bob"],
    });
    const workflowitemClosableByFriends = newWorkflowitem("friendsWorkflowitem", {
      [closeIntent]: ["friends"],
      [viewIntent]: ["friends"],
    });

    const workflowitems = [workflowitemClosableByBob, workflowitemClosableByFriends];
    const ordering = [workflowitemClosableByFriends.id, workflowitemClosableByBob.id];

    const projectForTesting = "ProjectA";
    const subprojectForTesting = "SubrojectA";

    const getOrdering: OrderingReader = () => Promise.resolve(ordering);
    const getWorkflowitems: ListReader = () => Promise.resolve(workflowitems);
    const closeWorkflowitem: Closer = async workflowitemId => {
      if (!workflowitems.filter(item => item.id === workflowitemId)) {
        return Promise.reject("Incorrect requirements");
      }
      return;
    };
    const notify: CloseNotifier = async (workflowitemId, actingUser) => {
      if (!workflowitems.filter(item => item.id === workflowitemId) || actingUser !== bob) {
        return Promise.reject("Incorrect requirements");
      }
      return;
    };

    await assertIsRejectedWith(
      close(bob, "bobWorkflowitem", {
        getOrdering,
        getWorkflowitems,
        closeWorkflowitem,
        notify,
      }),
    );
  });
});

describe("Updating a project", () => {
  const alice: User = { id: "alice", groups: ["otherfriends"] };
  const bob: User = { id: "bob", groups: ["friends"] };
  const notifier: UpdateNotifier = _workflowitem => Promise.resolve();
  const projectForTesting = "ProjectA";
  const subprojectForTesting = "SubrojectA";

  it("updates the workflowitem and shows the new data", async () => {
    const originalWorkflowitem = newWorkflowitem("originalWorkflowitem", {
      [updateIntent]: ["bob"],
      [viewIntent]: ["bob"],
    });
    const updatedWorkflowitem = originalWorkflowitem;

    const data: Update = {
      displayName: "Defg",
      amount: "1000",
      description: "Defg",
    };

    updatedWorkflowitem.displayName = data.displayName!;
    updatedWorkflowitem.amount = data.amount;
    updatedWorkflowitem.description = data.description!;

    const workflowitems = [originalWorkflowitem, updatedWorkflowitem];

    const getWorkflowitems: ListReader = () => Promise.resolve(workflowitems);
    const updateWorkflowitem: Updater = async (workflowitemId, _updateData) => {
      if (!(workflowitemId === originalWorkflowitem.id)) {
        return Promise.reject("Incorrect requirements");
      }
      return;
    };
    const notify: CloseNotifier = async (workflowitemId, _actingUser) => {
      if (!(workflowitemId === originalWorkflowitem.id)) {
        return Promise.reject("Incorrect requirements");
      }
      return;
    };

    await assertIsResolved(
      update(bob, workflowitems[0].id, data, {
        getWorkflowitems,
        updateWorkflowitem,
        notify,
      }),
    );
    assert.equal(JSON.stringify(originalWorkflowitem), JSON.stringify(updatedWorkflowitem));
  });
  it("requires specific permissions", async () => {
    const bobWorkflowitem = newWorkflowitem("bobWorkflowitem", {
      [updateIntent]: ["bob"],
      [viewIntent]: ["bob"],
    });
    const friendsWorkflowitem = newWorkflowitem("friendsWorkflowitem", {
      [updateIntent]: ["friends"],
      [viewIntent]: ["friends"],
    });
    const nonUpdatableWorkflowitem = newWorkflowitem("nonUpdatableWorkflowitem", {
      [updateIntent]: ["alice"],
      [viewIntent]: ["alice"],
    });
    const workflowitemIds: string[] = [
      "bobWorkflowitem",
      "friendsWorkflowitem",
      "nonUpdatableWorkflowitem",
    ];
    const workflowitems: Workflowitem[] = [
      bobWorkflowitem,
      friendsWorkflowitem,
      nonUpdatableWorkflowitem,
    ];

    const updatesData: Update = {
      displayName: "Defg",
      amount: "1000",
      description: "Defg",
    };

    const getWorkflowitems: ListReader = () => Promise.resolve(workflowitems);
    const updateWorkflowitem: Updater = async workflowitemId => {
      if (!workflowitemIds.includes(workflowitemId)) {
        return Promise.reject("Incorrect requirements");
      }
      return;
    };
    const notify: UpdateNotifier = async (workflowitemId, _actingUser) => {
      if (!workflowitemIds.includes(workflowitemId)) {
        return Promise.reject("Incorrect requirements");
      }
      return;
    };

    await assertIsResolved(
      update(bob, workflowitemIds[0], updatesData, {
        getWorkflowitems,
        updateWorkflowitem,
        notify,
      }),
    );

    await assertIsResolved(
      update(bob, workflowitemIds[1], updatesData, {
        getWorkflowitems,
        updateWorkflowitem,
        notify,
      }),
    );

    await assertIsRejectedWith(
      update(bob, workflowitemIds[2], updatesData, {
        getWorkflowitems,
        updateWorkflowitem,
        notify,
      }),
    ).catch(err => console.log(err));
  });
});
