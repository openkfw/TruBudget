import { assert } from "chai";
import { ConnToken } from ".";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { NotFound } from "./domain/errors/not_found";
import * as Group from "./domain/organization/group";
import { ServiceUser } from "./domain/organization/service_user";
import { UserRecord } from "./domain/organization/user_record";
import * as GroupQuery from "./group_query";

// Globals as test fixture (ignored by the mock'ed code):
const conn = (null as any) as ConnToken;
const ctx = (null as any) as Ctx;
const issuer = (null as any) as ServiceUser;

function newGroup(id: string, members: string[]): Group.Group {
  return {
    id,
    members,
    createdAt: "",
    displayName: "",
    description: "",
    permissions: {},
    log: [],
    additionalData: {},
  };
}

const dummy = "Dummy";

const dummyUserRecord: UserRecord = {
  id: dummy,
  createdAt: new Date().toISOString(),
  displayName: dummy,
  organization: dummy,
  passwordHash: dummy,
  address: dummy,
  encryptedPrivKey: dummy,
  permissions: {},
  log: [],
  additionalData: {},
};

describe("group_query.resolveUsers()", () => {
  context("given an user", async () => {
    it("returns the user", async () => {
      const identityToResolve = "Alice";

      const resolvedUsersResult = await GroupQuery.resolveUsers(
        conn,
        ctx,
        issuer,
        identityToResolve,
        async (_1, _2, _3, groupId) => new NotFound(_2, "group", groupId),
        async (_1, _2, _3, groupId) =>
          Promise.resolve(Result.unwrap({ ...dummyUserRecord, id: groupId })),
      );
      if (Result.isErr(resolvedUsersResult)) {
        throw resolvedUsersResult;
      }
      assert.sameMembers(resolvedUsersResult, ["Alice"]);
    });
  });

  context("given a group with one user", async () => {
    it("returns the one user", async () => {
      const identityToResolve = newGroup("identityToResolve", ["Alice"]);

      const resolvedUsersResult = await GroupQuery.resolveUsers(
        conn,
        ctx,
        issuer,
        identityToResolve.id,
        async (_1, _2, _3, groupId) => {
          if (groupId === "identityToResolve") return identityToResolve;
          return new NotFound(_2, "group", groupId);
        },
        async (_1, _2, _3, groupId) =>
          Promise.resolve(Result.unwrap({ ...dummyUserRecord, id: groupId })),
      );
      if (Result.isErr(resolvedUsersResult)) {
        throw resolvedUsersResult;
      }
      assert.sameMembers(resolvedUsersResult, ["Alice"]);
    });
  });

  context("given a group with a subgroup", async () => {
    it("returns all users of the subgroup", async () => {
      const identityToResolve = newGroup("identityToResolve", ["groupSub"]);
      const groupSub = newGroup("groupSub", ["Alice", "Bob", "Carol"]);

      const resolvedUsersResult = await GroupQuery.resolveUsers(
        conn,
        ctx,
        issuer,
        identityToResolve.id,
        async (_1, _2, _3, groupId) => {
          if (groupId === "identityToResolve") return identityToResolve;
          if (groupId === "groupSub") return groupSub;
          return new NotFound(_2, "group", groupId);
        },
        async (_1, _2, _3, _4) => Promise.resolve(Result.unwrap(dummyUserRecord)),
      );
      if (Result.isErr(resolvedUsersResult)) {
        throw resolvedUsersResult;
      }
      assert.sameMembers(resolvedUsersResult, ["Alice", "Bob", "Carol"]);
    });
  });

  context("given a group with users and subgroups", async () => {
    it("returns all users and users of the subgroups", async () => {
      const identityToResolve = newGroup("identityToResolve", ["Alice", "groupSub", "Bob"]);
      const groupSub = newGroup("groupSub", ["Carol"]);

      const resolvedUsersResult = await GroupQuery.resolveUsers(
        conn,
        ctx,
        issuer,
        identityToResolve.id,
        async (_1, _2, _3, groupId) => {
          if (groupId === "identityToResolve") return identityToResolve;
          if (groupId === "groupSub") return groupSub;
          return new NotFound(_2, "group", groupId);
        },
        async (_1, _2, _3, _4) => Promise.resolve(Result.unwrap(dummyUserRecord)),
      );
      if (Result.isErr(resolvedUsersResult)) {
        throw resolvedUsersResult;
      }
      assert.sameMembers(resolvedUsersResult, ["Alice", "Bob", "Carol"]);
    });
  });

  context("given an user belongs to multiple groups", async () => {
    it("returns each user only once", async () => {
      const identityToResolve = newGroup("identityToResolve", ["Alice", "groupSubA", "groupSubB"]);
      const groupSubA = newGroup("groupSubA", ["Alice"]);
      const groupSubB = newGroup("groupSubB", ["Alice", "Bob"]);

      const resolvedUsersResult = await GroupQuery.resolveUsers(
        conn,
        ctx,
        issuer,
        identityToResolve.id,
        async (_1, _2, _3, groupId) => {
          if (groupId === "identityToResolve") return identityToResolve;
          if (groupId === "groupSubA") return groupSubA;
          if (groupId === "groupSubB") return groupSubB;
          return new NotFound(_2, "group", groupId);
        },
        async (_1, _2, _3, _4) => Promise.resolve(Result.unwrap(dummyUserRecord)),
      );
      if (Result.isErr(resolvedUsersResult)) {
        throw resolvedUsersResult;
      }
      assert.sameMembers(resolvedUsersResult, ["Alice", "Bob"]);
    });
  });

  context("given a group with itself as a member", async () => {
    it("returns the users only", async () => {
      const identityToResolve = newGroup("identityToResolve", ["Alice", "identityToResolve"]);

      const resolvedUsersResult = await GroupQuery.resolveUsers(
        conn,
        ctx,
        issuer,
        identityToResolve.id,
        async (_1, _2, _3, groupId) => {
          if (groupId === "identityToResolve") return identityToResolve;
          return new NotFound(_2, "group", groupId);
        },
        async (_1, _2, _3, _4) => Promise.resolve(Result.unwrap(dummyUserRecord)),
      );
      if (Result.isErr(resolvedUsersResult)) {
        throw resolvedUsersResult;
      }
      assert.sameMembers(resolvedUsersResult, ["Alice"]);
    });
  });

  context("given two groups that reference each other", async () => {
    it("returns the users only", async () => {
      const identityToResolve = newGroup("identityToResolve", ["Alice", "groupLoopBack"]);
      const groupLoopBack = newGroup("groupLoopBack", ["Bob", "identityToResolve"]);

      const resolvedUsersResult = await GroupQuery.resolveUsers(
        conn,
        ctx,
        issuer,
        identityToResolve.id,
        async (_1, _2, _3, groupId): Promise<Result.Type<Group.Group>> => {
          if (groupId === "identityToResolve") return identityToResolve;
          if (groupId === "groupLoopBack") return groupLoopBack;
          return new NotFound(_2, "group", groupId);
        },
        async (_1, _2, _3, _4) => Promise.resolve(Result.unwrap(dummyUserRecord)),
      );
      if (Result.isErr(resolvedUsersResult)) {
        throw resolvedUsersResult;
      }
      assert.sameMembers(resolvedUsersResult, ["Alice", "Bob"]);
    });
  });
});
