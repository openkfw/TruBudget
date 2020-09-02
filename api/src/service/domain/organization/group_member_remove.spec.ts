import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { removeMember } from "./group_member_remove";
import { ServiceUser } from "./service_user";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const groupId = "group-id";
const groupWithoutPermissions = {
  id: "group-id",
  displayName: "dummy",
  description: "dummy",
  members: [alice.id],
  permissions: {},
  additionalData: {},
};
const dummyEvent: BusinessEvent[] = [
  {
    type: "group_created",
    source: ctx.source,
    publisher: alice.id,
    group: groupWithoutPermissions,
    time: new Date().toISOString(),
  },
];
const dummyEventWithPermissions = [
  {
    ...dummyEvent[0],
    group: { ...groupWithoutPermissions, permissions: { "group.removeUser": ["alice"] } },
  },
];
const baseRepository = {
  getGroupEvents: async () => Promise.resolve(dummyEvent),
};

describe("Remove member from group: authorization", () => {
  it("Without the group.removeUser permission, a user cannot remove a member from a group", async () => {
    const result = await removeMember(ctx, alice, groupId, bob.id, baseRepository);
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });
  it("With the group.removeUser permission, a user can remove a member from a group", async () => {
    const result = await removeMember(ctx, alice, groupId, bob.id, {
      ...baseRepository,
      getGroupEvents: async () => Promise.resolve(dummyEventWithPermissions),
    });
    assert.isTrue(Result.isOk(result));
  });

  it("The root user can always remove members from a group", async () => {
    const result = await removeMember(ctx, root, groupId, bob.id, baseRepository);
    assert.isTrue(Result.isOk(result));
  });
});

describe("Remove member from group: preconditions", () => {
  it("Removing a member from a group fails if the group cannot be found", async () => {
    const result = await removeMember(ctx, alice, groupId, bob.id, {
      ...baseRepository,
      getGroupEvents: async () => Promise.resolve([]),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});
