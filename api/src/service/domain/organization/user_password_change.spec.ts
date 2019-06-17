import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { hashPassword, isPasswordMatch } from "../../password";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import { newUserFromEvent } from "./user_eventsourcing";
import { changeUserPassword, RequestData } from "./user_password_change";
import { UserRecord } from "./user_record";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };

const dummy = "dummy";
const passwordChangeUser: UserRecord = {
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

const requestData: RequestData = {
  userId: dummy,
  newPassword: "newtest",
};

const baseRepository = {
  getUser: () => Promise.resolve(passwordChangeUser),
  hash: () => Promise.resolve("passwordHash"),
};

describe("change a user's password: authorization", () => {
  it("Without the user.changePassword permission, a user cannot change a password", async () => {
    const result = await changeUserPassword(ctx, alice, requestData, {
      ...baseRepository,
    });
    assert.instanceOf(result, NotAuthorized);
  });

  it("The root user doesn't need permission to change a user's password", async () => {
    const result = await changeUserPassword(ctx, root, requestData, {
      ...baseRepository,
    });
    if (Result.isErr(result)) {
      throw result;
    }
    assert.isTrue(Result.isOk(result));
    assert.isTrue(result.length > 0);
  });

  it("A user can change another user's password if the correct permissions are given", async () => {
    const result = await changeUserPassword(ctx, alice, requestData, {
      ...baseRepository,
      getUser: () =>
        Promise.resolve({
          ...passwordChangeUser,
          permissions: { "user.changePassword": [alice.id] },
        }),
    });
    if (Result.isErr(result)) {
      throw result;
    }
    assert.isTrue(Result.isOk(result));
    assert.isTrue(result.length > 0);
  });
});

describe("change a user's password: how modifications are applied", () => {
  it("Changes the user's password immediately", async () => {
    const oldPassword = "passwordTest";
    const oldPasswordHash = await hashPassword(oldPassword);
    const newPassword = "newPassword";
    const reqData = {
      userId: dummy,
      newPassword,
    };

    assert.isTrue(await isPasswordMatch(oldPassword, oldPasswordHash));
    const result = await changeUserPassword(ctx, alice, reqData, {
      ...baseRepository,
      hash: async passwordPlaintext => hashPassword(passwordPlaintext),
      getUser: async () =>
        Promise.resolve({
          ...passwordChangeUser,
          permissions: { "user.changePassword": [alice.id] },
        }),
    });
    if (Result.isErr(result)) {
      throw result;
    }

    const sourcedUser = result.reduce(
      (user, event) => newUserFromEvent(ctx, user, event),
      passwordChangeUser,
    );
    if (Result.isErr(sourcedUser)) {
      throw sourcedUser;
    }
    assert.isTrue(Result.isOk(result));
    assert.isFalse(await isPasswordMatch(oldPassword, sourcedUser.passwordHash));
    assert.isTrue(await isPasswordMatch(newPassword, sourcedUser.passwordHash));
  });
});
