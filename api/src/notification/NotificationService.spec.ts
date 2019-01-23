import { assert } from "chai";

import * as Notification from ".";

describe("A notification for project.assign", () => {
  it("is sent to the assignee", async () => {
    const actingUser = "alice";
    const assignee = "bob";

    const assignmentNotification: Notification.ProjectAssignment = {
      projectId: "test project",
      actingUser,
      assignee,
    };

    const callSpy = [0];
    const sender: Notification.Sender = async (message, recipient) => {
      ++callSpy[0];
      assert.equal(recipient, assignee);
    };

    const resolver: Notification.GroupResolver = async groupId => [];

    await Notification.projectAssigned(assignmentNotification, {
      send: sender,
      resolveGroup: resolver,
    });

    // Make sure the sender has actually been invoked:
    assert.equal(callSpy[0], 1);
  });

  it("is never sent to the creator", async () => {
    const actingUser = "alice";
    const assignee = "alice";

    const assignmentNotification: Notification.ProjectAssignment = {
      projectId: "test project",
      actingUser,
      assignee,
    };

    const sender: Notification.Sender = async (message, recipient) => {
      throw Error("this should not be called");
    };

    const resolver: Notification.GroupResolver = async groupId => [];

    await Notification.projectAssigned(assignmentNotification, {
      send: sender,
      resolveGroup: resolver,
    });
  });

  it(", if the assignee is a group, is sent to all group members", async () => {
    const assigner = "alice";
    const friends = ["bob", "charlie", "damian"];

    const assignmentNotification: Notification.ProjectAssignment = {
      projectId: "test project",
      actingUser: assigner,
      assignee: "friends",
    };

    const callSpy = [0];
    const sender: Notification.Sender = async (message, recipient) => {
      ++callSpy[0];
      assert.oneOf(recipient, friends);
    };

    const resolver: Notification.GroupResolver = async groupId =>
      groupId === "friends" ? friends : [];

    await Notification.projectAssigned(assignmentNotification, {
      send: sender,
      resolveGroup: resolver,
    });

    // Make sure the sender has actually been invoked:
    assert.equal(callSpy[0], 3);
  });

  it(", if the assignee is a group, is never sent to the creator", async () => {
    const assigner = "alice";
    const friends = ["alice", "bob", "charlie", "damian"];
    // All friends except Alice receive a notification:
    const expectedRecipients = ["bob", "charlie", "damian"];

    const assignmentNotification: Notification.ProjectAssignment = {
      projectId: "test project",
      actingUser: assigner,
      assignee: "friends",
    };

    const callSpy = [0];
    const sender: Notification.Sender = async (message, recipient) => {
      ++callSpy[0];
      assert.oneOf(recipient, expectedRecipients);
    };

    const resolver: Notification.GroupResolver = async groupId =>
      groupId === "friends" ? friends : [];

    await Notification.projectAssigned(assignmentNotification, {
      send: sender,
      resolveGroup: resolver,
    });

    // Make sure the sender has actually been invoked:
    assert.equal(callSpy[0], 3);
  });
});
