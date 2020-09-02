import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { addMember } from "./group_member_add";
import { ServiceUser } from "./service_user";

const ctx: Ctx = { requestId: "", source: "test" };
const groupId = "group-id";
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: [groupId] };
const bob: ServiceUser = { id: "bob", groups: [] };
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
}];
const dummyEventWithPermissions = [{
  ...dummyEvent[0],
  group: {...groupWithoutPermissions,
    permissions: {"group.addUser": ["alice"]}},
  }];

const baseRepository = {
    getGroupEvents: async () => Promise.resolve(dummyEvent),
};

describe("Add new member to group: authorization", () => {
  it("Without the group.addUser permission, a user cannot add a new member to a group", async () => {
    const result = await addMember(ctx, alice, groupId, bob.id, baseRepository);
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("With the group.addUser permission, a user can add a new member to a group", async () => {
    const result = await addMember(ctx, alice, groupId, bob.id,
      {
      ...baseRepository,
      getGroupEvents: async () => Promise.resolve(dummyEventWithPermissions),
        });
    assert.isTrue(Result.isOk(result));
  });

  it("The root user can always add members to a group", async () => {
    const result = await addMember(ctx, root, groupId, bob.id, baseRepository);
    assert.isTrue(Result.isOk(result));
  });
});
describe("Add new member to group: preconditions", () => {
  it("Adding a new member to a group fails if the group cannot be found", async () => {
    const result = await addMember(ctx, alice, groupId, bob.id,
      {
      ...baseRepository,
      getGroupEvents: async () => Promise.resolve([]),
        });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});
