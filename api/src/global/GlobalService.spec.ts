import { assert } from "chai";

import * as Permission from ".";
import { PermissionsGranter, PermissionsLister } from ".";
import Intent, { userAssignableIntents } from "../authz/intents";
import { assertIsRejectedWith, assertIsResolved } from "../lib/test/promise";
import { Permissions } from "./Permission";
import { User } from "./User";

describe("Listing permissions", () => {
  it("is allowed if the user has the required permission", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: PermissionsLister = () => Promise.resolve(permissionsMock);

    const permissions = await Permission.list(actingUser, { getAllPermissions });

    assert.equal(permissionsMock, permissions);
  });

  it("is rejected if the user does not have the required permission", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };
    let getAllPermissions: PermissionsLister = () => Promise.resolve(permissionsMock);
    const listedPermissions = await Permission.list(actingUser, { getAllPermissions });

    assert.equal(listedPermissions, permissionsMock);

    delete permissionsMock["global.listPermissions"];
    getAllPermissions = async () => permissionsMock;

    await assertIsRejectedWith(Permission.list(actingUser, { getAllPermissions }), Error);
  });
});

describe("Granting a permission", () => {
  it("is granting the permission correctly", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["alice"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: PermissionsLister = () => Promise.resolve(permissionsMock);

    const calls = new Map<string, string>();
    const grantPermission: PermissionsGranter = (intent, grantee): Promise<void> => {
      calls.set(intent, grantee);
      return Promise.resolve();
    };

    const intentToBeGranted: Intent = "global.createProject";
    const userId = "bob";

    const deps = {
      getAllPermissions,
      grantPermission,
    };

    await assertIsResolved(Permission.grant(actingUser, userId, intentToBeGranted, deps));

    assert.equal(calls.get("global.createProject"), userId);
  });

  it("requires a specific permission", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: PermissionsLister = async () => permissionsMock;

    const calls = new Map<string, string>();
    const grantPermission: PermissionsGranter = async (intent, grantee): Promise<void> => {
      calls.set(intent, grantee);
    };

    const intentToBeGranted: Intent = "global.createProject";
    const userId = "alice";

    const deps = {
      getAllPermissions,
      grantPermission,
    };

    await assertIsRejectedWith(
      Permission.grant(actingUser, userId, intentToBeGranted, deps),
      Error,
    );
  });

  it("will not call grantPermission if permission is already set", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["alice"],
      "global.createProject": ["alice"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: PermissionsLister = async () => permissionsMock;

    const calls = new Map<string, string>();
    const grantPermission: PermissionsGranter = async (intent, grantee): Promise<void> => {
      calls.set(intent, grantee);
    };

    const intentToBeGranted: Intent = "global.createProject";
    const userid = "alice";

    const deps = {
      getAllPermissions,
      grantPermission,
    };

    await assertIsResolved(Permission.grant(actingUser, userid, intentToBeGranted, deps));

    assert.isUndefined(calls.get("global.createProject"), userid);
  });
});

describe("Granting all permissions", () => {
  it("is allowed if the user has the required permissions", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["alice"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: PermissionsLister = async () => permissionsMock;

    const calls = new Map<string, string>();
    const grantPermission: PermissionsGranter = async (intent, grantee): Promise<void> => {
      calls.set(intent, grantee);
    };

    const identity = "otherUser";

    const deps = {
      getAllPermissions,
      grantPermission,
    };

    await assertIsResolved(Permission.grantAll(actingUser, identity, deps));

    assert.equal(calls.size, userAssignableIntents.length);
  });

  it("is rejected if the user does not have the required permission", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: PermissionsLister = async () => permissionsMock;

    const grantPermission: PermissionsGranter = (intent, grantee): Promise<void> => {
      return Promise.resolve();
    };

    const identity = "alice";

    const deps = {
      getAllPermissions,
      grantPermission,
    };

    await assertIsRejectedWith(Permission.grantAll(actingUser, identity, deps), Error);
  });

  it("will only call grantPermission if permission is not set already", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["alice"],
      "global.createProject": ["alice"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: PermissionsLister = async () => permissionsMock;

    const calls = new Map<string, string>();
    const grantPermission: PermissionsGranter = async (intent, grantee): Promise<void> => {
      calls.set(intent, grantee);
    };

    const identity = "friends";

    const deps = {
      getAllPermissions,
      grantPermission,
    };

    await assertIsResolved(Permission.grantAll(actingUser, identity, deps));

    assert.equal(calls.size, userAssignableIntents.length - 1);
  });
});
