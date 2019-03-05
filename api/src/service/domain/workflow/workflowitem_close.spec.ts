// import { assert } from "chai";

// import { Ctx } from "../../../lib/ctx";
// import { BusinessEvent } from "../business_event";
// import { NotAuthorized } from "../errors/not_authorized";
// import { PreconditionError } from "../errors/precondition_error";
// import { ServiceUser } from "../organization/service_user";
// import { closeWorkflowitem } from "./workflowitem_close";
// import * as WorkflowitemCreated from "./workflowitem_created";
// import { WorkflowitemOrdering } from "./workflowitem_ordering";

// const ctx: Ctx = {
//   requestId: "test",
//   source: "test",
// };

// describe("Closing a workflowitem", () => {
//   const alice: ServiceUser = { id: "alice", groups: ["friends"] };
//   // const bob: User = { id: "bob", groups: ["friends"] };

//   it("is a no-op if the workflowitem does not exist.", () => {
//     const events: BusinessEvent[] = [];
//     const ordering: WorkflowitemOrdering = [];
//     const workflowitemId = "does-not-exist";

//     // Closing a non-existant workflowitem has no effect,
//     // that is, no new events are generated:
//     const { newEvents, errors } = closeWorkflowitem(ctx, alice, events, ordering, workflowitemId);
//     assert.isEmpty(errors);
//     assert.isEmpty(newEvents);
//   });

//   it("requires the workflowitem.close permission.", () => {
//     for (const permissionGrantedTo of ["alice", "friends"]) {
//       const workflowitemId = "test";
//       const subprojectId = "";
//       const projectId = "";
//       const publisher = "another_user";
//       const events: BusinessEvent[] = [
//         // A create event without any permissions for Alice/Friends:
//         WorkflowitemCreated.createEvent(ctx.source, publisher, projectId, subprojectId, {
//           id: workflowitemId,
//           displayName: "test",
//           amountType: "N/A",
//           description: "",
//           status: "open",
//           assignee: "another_user",
//           documents: [],
//           permissions: {},
//           additionalData: {},
//         }),
//       ];
//       const ordering: WorkflowitemOrdering = [];

//       // Without the permission, Alice/Friends is/are not authorized to execute the command:
//       let result = closeWorkflowitem(ctx, alice, events, ordering, workflowitemId);
//       assert.isEmpty(result.newEvents);
//       assert.lengthOf(result.errors, 1);
//       assert.instanceOf(result.errors[0], NotAuthorized);

//       // This time, Alice/Friends get(s) the right permissions:
//       events[0] = WorkflowitemCreated.createEvent(ctx.source, publisher, projectId, subprojectId, {
//         id: workflowitemId,
//         displayName: "test",
//         amountType: "N/A",
//         description: "",
//         status: "open",
//         assignee: "another_user",
//         documents: [],
//         permissions: { "workflowitem.close": [permissionGrantedTo] },
//         additionalData: {},
//       });

//       // With the right permissions, Alice/Friends can successfully close the workflowitem:
//       result = closeWorkflowitem(ctx, alice, events, ordering, workflowitemId);
//       assert.isEmpty(result.errors);
//       assert.isTrue(
//         result.newEvents &&
//           result.newEvents.length > 0 &&
//           result.newEvents[0].type === "workflowitem_closed",
//       );
//     }
//   });

//   it("fails if any previous workflowitem is not closed.", () => {
//     const subprojectId = "";
//     const projectId = "";
//     const publisher = "another_user";
//     let events: BusinessEvent[] = [
//       // A non-closed workflowitem that comes first:
//       WorkflowitemCreated.createEvent(ctx.source, publisher, projectId, subprojectId, {
//         id: "first",
//         displayName: "test",
//         amountType: "N/A",
//         description: "",
//         status: "open",
//         assignee: "another_user",
//         documents: [],
//         permissions: {},
//         additionalData: {},
//       }),
//       // We'll try to close this one:
//       WorkflowitemCreated.createEvent(ctx.source, publisher, projectId, subprojectId, {
//         id: "second",
//         displayName: "test",
//         amountType: "N/A",
//         description: "",
//         status: "open",
//         assignee: "another_user",
//         documents: [],
//         permissions: {},
//         additionalData: {},
//       }),
//     ];
//     const ordering: WorkflowitemOrdering = ["first", "second"];

//     // This fails as the earlier item is not yet closed:
//     let result = closeWorkflowitem(ctx, alice, events, ordering, "second");
//     assert.isEmpty(result.newEvents);
//     assert.lengthOf(result.errors, 1);
//     assert.instanceOf(result.errors[0], PreconditionError);

//     // Now we close the earlier one:
//     const { newEvents } = closeWorkflowitem(ctx, alice, events, ordering, "first");
//     events = events.concat(newEvents!);

//     // Now it no longer fails:
//     result = closeWorkflowitem(ctx, alice, events, ordering, "second");
//     assert.isEmpty(result.errors);
//   });

//   it("triggers a notification towards the assignee if successful.", () => {
//     const subprojectId = "";
//     const projectId = "";
//     const publisher = "another_user";
//     const events: BusinessEvent[] = [
//       WorkflowitemCreated.createEvent(ctx.source, publisher, projectId, subprojectId, {
//         id: "test-id",
//         displayName: "test",
//         amountType: "N/A",
//         description: "",
//         status: "open",
//         assignee: "the_assignee",
//         documents: [],
//         permissions: {},
//         additionalData: {},
//       }),
//     ];
//     const ordering: WorkflowitemOrdering = [];

//     // Closing it also generates a notification towards the assignee:
//     const result = closeWorkflowitem(ctx, alice, events, ordering, "test-id");
//     assert.isEmpty(result.errors);
//     assert.isTrue(result.newEvents && result.newEvents.length === 2);
//     const notification = result.newEvents![1];
//     assert.isTrue(
//       notification.type === "notification" && notification.recipient === "the_assignee",
//     );
//   });
// });
