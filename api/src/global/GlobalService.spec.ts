import { assert } from "chai";

import * as Permission from ".";
import { ListReader } from ".";
import { assertIsRejectedWith } from "../lib/test/promise";
import { Permissions } from "./Permission";
import { User } from "./User";

describe("Listing permissions", () => {
  it("is allowed if the user has the required permission", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };

    const getAllPermissions: ListReader = async () => permissionsMock;

    const permissions = await Permission.list(actingUser, { getAllPermissions });

    assert.equal(permissionsMock, permissions);
  });

  it("is rejected if the user does not have the required permission", async () => {
    const permissionsMock: Permissions = {
      "global.listPermissions": ["alice", "friends"],
      "global.grantPermission": ["otherUser"],
    };
    const actingUser: User = { id: "alice", groups: ["friends"] };
    let getAllPermissions: ListReader = () => Promise.resolve(permissionsMock);

    delete permissionsMock["global.listPermissions"];
    getAllPermissions = async () => permissionsMock;

    await assertIsRejectedWith(Permission.list(actingUser, { getAllPermissions }), Error);
  });
});
