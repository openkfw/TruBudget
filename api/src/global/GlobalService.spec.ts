import { assert } from "chai";

import * as Permission from ".";
import { PermissionGranter, PermissionListReader } from ".";
import Intent from "../authz/intents";
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

    const getAllPermissions: PermissionListReader = async () => permissionsMock;

    const permissions = await Permission.list(actingUser, { getAllPermissions });

    assert.equal(permissionsMock, permissions);
  });

  it("is rejected if the user does not have the required permission", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };
    let getAllPermissions: PermissionListReader = () => Promise.resolve(permissionsMock);

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

    const getAllPermissions: PermissionListReader = () => Promise.resolve(permissionsMock);

    const calls = new Map<string, string>();
    const grantPermission: PermissionGranter = (intent, userId) => {
      calls.set(intent, userId);
      return Promise.resolve();
    };

    const intentToBeGranted: Intent = "global.createProject";
    const identity = "bob";

    const deps = {
      getAllPermissions,
      grantPermission,
    };

    await assertIsResolved(Permission.grant(actingUser, identity, intentToBeGranted, deps));

    assert.equal(calls.get("global.createProject"), identity);
  });

  it("requires a specific permission", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: PermissionListReader = () => Promise.resolve(permissionsMock);

    const calls = new Map<string, string>();
    const grantPermission: PermissionGranter = (intent, userId) => {
      calls.set(intent, userId);
      return Promise.resolve();
    };

    const intentToBeGranted: Intent = "global.createProject";
    const identity = "alice";

    const deps = {
      getAllPermissions,
      grantPermission,
    };

    await assertIsRejectedWith(
      Permission.grant(actingUser, identity, intentToBeGranted, deps),
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

    const getAllPermissions: PermissionListReader = () => Promise.resolve(permissionsMock);

    const calls = new Map<string, string>();
    const grantPermission: PermissionGranter = (intent, userId) => {
      calls.set(intent, userId);
      return Promise.resolve();
    };

    const intentToBeGranted: Intent = "global.createProject";
    const identity = "alice";

    const deps = {
      getAllPermissions,
      grantPermission,
    };

    await assertIsResolved(Permission.grant(actingUser, identity, intentToBeGranted, deps));

    assert.isUndefined(calls.get("global.createProject"), identity);
  });
});
