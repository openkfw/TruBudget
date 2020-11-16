import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import { Workflowitem } from "../workflow/workflowitem";
import * as WorkflowitemAssigned from "../workflow/workflowitem_assigned";
import { applyWorkflowitemType } from "./apply_workflowitem_type";

const ctx: Ctx = { requestId: "", source: "test" };
const alice: ServiceUser = { id: "alice", groups: [] };
const bob: ServiceUser = { id: "bob", groups: [] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy";
const workflowitemNoType: Workflowitem = {
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
  log: [],
  assignee: alice.id,
  additionalData: {},
};
const workflowitemRestricted: Workflowitem = {
  isRedacted: false,
  id: workflowitemId,
  subprojectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: "dummy",
  description: "dummy",
  amountType: "N/A",
  assignee: alice.id,
  documents: [],
  permissions: {
    "workflowitem.intent.revokePermission": [alice.id],
    "workflowitem.intent.grantPermission": [alice.id],
  },
  log: [],
  additionalData: {},
  workflowitemType: "restricted",
};

describe("Check workflowitem's type behavior", () => {
  it("If workflowitem has no type, no error occurs", () => {
    const assigner = alice;
    const assignee = bob.id;
    const assignEvent = WorkflowitemAssigned.createEvent(
      ctx.source,
      assigner.id,
      projectId,
      subprojectId,
      workflowitemId,
      assignee,
    );
    if (Result.isErr(assignEvent)) {
      throw assignEvent;
    }
    const workflowitemTypeEvents = applyWorkflowitemType(
      assignEvent,
      ctx,
      assigner,
      workflowitemNoType,
    );

    assert.isTrue(Result.isOk(workflowitemTypeEvents), (workflowitemTypeEvents as Error).message);
  });

  describe("Workflowitem type: restricted", () => {
    it("When assigning a workflowitem of type restricted, permissions are automatically granted and revoked", () => {
      const assigner = alice;
      const assignee = bob.id;
      const assignEvent = WorkflowitemAssigned.createEvent(
        ctx.source,
        assigner.id,
        projectId,
        subprojectId,
        workflowitemId,
        assignee,
      );
      if (Result.isErr(assignEvent)) {
        throw assignEvent;
      }
      const workflowitemTypeEvents = applyWorkflowitemType(
        assignEvent,
        ctx,
        assigner,
        workflowitemRestricted,
      );

      assert.isTrue(Result.isOk(workflowitemTypeEvents), (workflowitemTypeEvents as Error).message);
      const newEvents = Result.unwrap(workflowitemTypeEvents);

      // Check if the permissions are granted
      assert.isTrue(
        newEvents.some(
          (event) => event.type === "workflowitem_permission_granted" && event.grantee === bob.id,
        ),
      );

      // Check if the permissions are revoked
      assert.isTrue(
        newEvents.some(
          (event) => event.type === "workflowitem_permission_revoked" && event.revokee === alice.id,
        ),
      );
    });

    it("Without permissions to grant and revoke, restricted workflowitem's behavior can't be applied", () => {
      const assigner = bob;
      const assignee = alice.id;
      const assignEvent = WorkflowitemAssigned.createEvent(
        ctx.source,
        assigner.id,
        projectId,
        subprojectId,
        workflowitemId,
        assignee,
      );
      if (Result.isErr(assignEvent)) {
        throw assignEvent;
      }
      const workflowitemTypeEvents = applyWorkflowitemType(
        assignEvent,
        ctx,
        assigner,
        workflowitemRestricted,
      );

      // NotAuthorized Error as the type can't be applied
      assert.isTrue(Result.isErr(workflowitemTypeEvents));
      assert.instanceOf(workflowitemTypeEvents, NotAuthorized);
    });
  });
});
