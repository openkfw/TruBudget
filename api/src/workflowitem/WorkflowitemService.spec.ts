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

// describe("Assigning a project,", () => {
//   it("requires a specific permission.", async () => {
//     const alice: User = { id: "alice", groups: ["friends"] };

//     const assignIntent: Intent = "project.assign";

//     const projectAssignableToAlice = newProject("aliceProject", { [assignIntent]: ["alice"] });
//     const projectAssignableToFriends = newProject("friendsProject", {
//       [assignIntent]: ["friends"],
//     });
//     const nonAssignableProject = newProject("nonAssignableProject", {});

//     const reader: Reader = id => {
//       switch (id) {
//         case "aliceProject":
//           return Promise.resolve(projectAssignableToAlice);
//         case "friendsProject":
//           return Promise.resolve(projectAssignableToFriends);
//         case "nonAssignableProject":
//           return Promise.resolve(nonAssignableProject);
//         default:
//           return Promise.reject(id);
//       }
//     };

//     const calls = new Map<string, number>();
//     const assigner: Assigner = (projectId: string, _assignee: string): Promise<void> => {
//       calls.set(projectId, (calls.get(projectId) || 0) + 1);
//       return Promise.resolve();
//     };

//     const notifier: AssignmentNotifier = (project: Project, _assigner: string): Promise<void> =>
//       Promise.resolve();

//     const deps = {
//       getProject: reader,
//       saveProjectAssignment: assigner,
//       notify: notifier,
//     };

//     await assertIsResolved(assign(alice, "aliceProject", "bob", deps));

//     await assertIsResolved(assign(alice, "friendsProject", "bob", deps));

//     await assertIsRejectedWith(assign(alice, "nonAssignableProject", "bob", deps), Error);

//     assert.equal(calls.get("aliceProject"), 1);
//     assert.equal(calls.get("friendsProject"), 1);
//     assert.isUndefined(calls.get("nonAssignableProject"));
//   });

//   it("tells the notifier about the event only if successful.", async () => {
//     const alice: User = { id: "alice", groups: ["friends"] };

//     const assignIntent: Intent = "project.assign";

//     const projectAssignableToAlice = newProject("aliceProject", { [assignIntent]: ["alice"] });
//     const projectAssignableToFriends = newProject("friendsProject", {
//       [assignIntent]: ["friends"],
//     });
//     const nonAssignableProject = newProject("nonAssignableProject", {});

//     const reader: Reader = id => {
//       switch (id) {
//         case "aliceProject":
//           return Promise.resolve(projectAssignableToAlice);
//         case "nonAssignableProject":
//           return Promise.resolve(nonAssignableProject);
//         default:
//           return Promise.reject(id);
//       }
//     };

//     const assigner: Assigner = (projectId: string, _assignee: string): Promise<void> =>
//       Promise.resolve();

//     const calls = new Map<string, number>();
//     const notifier: AssignmentNotifier = (project: Project, _assigner: string): Promise<void> => {
//       calls.set(project.id, (calls.get(project.id) || 0) + 1);
//       return Promise.resolve();
//     };

//     const deps = {
//       getProject: reader,
//       saveProjectAssignment: assigner,
//       notify: notifier,
//     };

//     await assertIsResolved(assign(alice, "aliceProject", "bob", deps));
//     await assertIsRejectedWith(assign(alice, "nonAssignableProject", "bob", deps), Error);

//     assert.equal(calls.get("aliceProject"), 1);
//     assert.isUndefined(calls.get("nonAssignableProject"));
//   });
// });
