import { assert } from "chai";

import * as Permission from ".";
import { ListReader } from ".";
import { assertIsRejectedWith } from "../lib/test/promise";
import { Permissions } from "./Permission";
import { User } from "./User";

describe("Listing permissions", () => {
  it("is listing all permissions correctly", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: ListReader = () => Promise.resolve(permissionsMock);

    const permissions = await Permission.list(actingUser, { getAllPermissions });

    assert.equal(permissionsMock, permissions);
  });

  it("requires a specific permission", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };
    let getAllPermissions: ListReader = () => Promise.resolve(permissionsMock);
    const listedPermissions = await Permission.list(actingUser, { getAllPermissions });

    await assert.equal(listedPermissions, permissionsMock);

    delete permissionsMock["global.listPermissions"];
    getAllPermissions = () => Promise.resolve(permissionsMock);

    await assertIsRejectedWith(Permission.list(actingUser, { getAllPermissions }), Error);
  });
});
