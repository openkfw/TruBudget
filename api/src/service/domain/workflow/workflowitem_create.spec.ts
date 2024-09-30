import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { UserRecord } from "../organization/user_record";

import { Subproject } from "./subproject";
import * as WorkflowitemCreate from "./workflowitem_create";

const ctx: Ctx = { requestId: "", source: "test" };
const address = "address";
const root: ServiceUser = { id: "root", groups: [], address };
const alice: ServiceUser = { id: "alice", groups: [], address };

const baseSubproject: Subproject = {
  id: "dummy-subproject",
  projectId: "test",
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: "alice",
  workflowitemType: "restricted",
  displayName: "test",
  description: "test",
  currency: "EUR",
  projectedBudgets: [],
  workflowitemOrdering: [],
  permissions: { "subproject.createWorkflowitem": [alice.id] },
  log: [],
  additionalData: {},
};

const normalUser: UserRecord = {
  id: "test",
  createdAt: new Date().toISOString(), // ISO timestamp
  displayName: "testuser",
  organization: "Test Org",
  passwordHash: "abc",
  address: "testaddress",
  encryptedPrivKey: "abcd",
  permissions: { ["user.authenticate"]: ["test"] },
  log: [],
  additionalData: {},
};

const disabledUser: UserRecord = {
  id: "test",
  createdAt: new Date().toISOString(), // ISO timestamp
  displayName: "testuser",
  organization: "Test Org",
  passwordHash: "abc",
  address: "testaddress",
  encryptedPrivKey: "abcd",
  permissions: {}, // no auth permissions
  log: [],
  additionalData: {},
};

describe("Create workflowitem", () => {
  it("Root cannot create a workflow item", async () => {
    const data: WorkflowitemCreate.RequestData = {
      projectId: "test",
      subprojectId: "dummy-subproject",
      displayName: "test",
      amountType: "N/A",
      workflowitemType: "general",
    };

    const result = await WorkflowitemCreate.createWorkflowitem(ctx, root, data, {
      workflowitemExists: async (_projectId, _subprojectId, _workflowitemId) => false,
      userExists: async (_userId) => true,
      getUser: async (_userId) => normalUser,
      getSubproject: async () => baseSubproject,
      applyWorkflowitemType: () => [],
      uploadDocumentToStorageService: () => Promise.resolve([]),
      getAllDocumentReferences: async () => [],
    });

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(Result.unwrapErr(result), PreconditionError);
  });

  it("The workflowitem type must be the one set on the parent subproject", async () => {
    const data: WorkflowitemCreate.RequestData = {
      projectId: "test",
      subprojectId: "dummy-subproject",
      displayName: "test",
      amountType: "N/A",
      workflowitemType: "general",
    };

    const result = await WorkflowitemCreate.createWorkflowitem(ctx, alice, data, {
      workflowitemExists: async (_projectId, _subprojectId, _workflowitemId) => false,
      userExists: async (_userId) => true,
      getUser: async (_userId) => normalUser,
      getSubproject: async () => baseSubproject,
      applyWorkflowitemType: () => [],
      uploadDocumentToStorageService: () => Promise.resolve([]),
      getAllDocumentReferences: async () => [],
    });

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(Result.unwrapErr(result), PreconditionError);
  });

  it("Cannot create a workflow item if the assigned user does not exist!", async () => {
    const data: WorkflowitemCreate.RequestData = {
      projectId: "test",
      subprojectId: "dummy-subproject",
      displayName: "test",
      amountType: "N/A",
      workflowitemType: "general",
    };

    const result = await WorkflowitemCreate.createWorkflowitem(ctx, alice, data, {
      workflowitemExists: async (_projectId, _subprojectId, _workflowitemId) => false,
      userExists: async (_userId) => false,
      getUser: async (_userId) => normalUser,
      getSubproject: async () => baseSubproject,
      applyWorkflowitemType: () => [],
      uploadDocumentToStorageService: () => Promise.resolve([]),
      getAllDocumentReferences: async () => [],
    });

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(Result.unwrapErr(result), PreconditionError);
  });

  it("Cannot create a workflow item if the assigned user is disabled!", async () => {
    const data: WorkflowitemCreate.RequestData = {
      projectId: "test",
      subprojectId: "dummy-subproject",
      displayName: "test",
      amountType: "N/A",
      workflowitemType: "general",
    };

    const result = await WorkflowitemCreate.createWorkflowitem(ctx, alice, data, {
      workflowitemExists: async (_projectId, _subprojectId, _workflowitemId) => false,
      userExists: async (_userId) => false,
      getUser: async (_userId) => disabledUser,
      getSubproject: async () => baseSubproject,
      applyWorkflowitemType: () => [],
      uploadDocumentToStorageService: () => Promise.resolve([]),
      getAllDocumentReferences: async () => [],
    });

    assert.isTrue(Result.isErr(result));
    assert.instanceOf(Result.unwrapErr(result), PreconditionError);
  });

  it("creates a workflow", async () => {
    const data: WorkflowitemCreate.RequestData = {
      projectId: "test",
      subprojectId: "dummy-subproject",
      displayName: "test",
      amountType: "N/A",
      workflowitemType: "restricted",
    };

    const result = await WorkflowitemCreate.createWorkflowitem(ctx, alice, data, {
      workflowitemExists: async (_projectId, _subprojectId, _workflowitemId) => false,
      userExists: async (_userId) => true,
      getUser: async (_userId) => normalUser,
      getSubproject: async () => baseSubproject,
      applyWorkflowitemType: () => [],
      uploadDocumentToStorageService: () => Promise.resolve([]),
      getAllDocumentReferences: async () => [],
    });

    assert.isFalse(Result.isErr(result));
  });
});
