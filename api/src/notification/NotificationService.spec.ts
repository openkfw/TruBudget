import { assert } from "chai";

import { NotificationAPI } from ".";
import { GroupResolver, NotificationService, Sender } from ".";
import { Event } from "../multichain/event";
import { Project } from "./Project";

describe("A notification for project.assign", () => {
  it("is sent to the assignee", async () => {
    const assigner = "alice";
    const assignee = "bob";

    const project: Project = {
      id: "test project",
      status: "open",
      displayName: "my test project",
      assignee,
    };

    const callSpy = [0];
    const sender: Sender = {
      send(message: Event, recipient: string): Promise<void> {
        ++callSpy[0];
        assert.equal(recipient, assignee);
        return Promise.resolve();
      },
    };

    const resolver: GroupResolver = {
      resolveGroup(groupId: string): Promise<string[]> {
        return Promise.resolve([]);
      },
    };

    const api: NotificationAPI = new NotificationService();
    await api.projectAssigned(sender, resolver, assigner, project);

    // Make sure the sender has actually been invoked:
    assert.equal(callSpy[0], 1);
  });

  it("is never sent to the creator", async () => {
    const assigner = "alice";
    const assignee = "alice";

    const project: Project = {
      id: "test project",
      status: "open",
      displayName: "my test project",
      assignee,
    };

    const sender: Sender = {
      send(message: Event, recipient: string): Promise<void> {
        throw Error("this should not be called");
      },
    };

    const resolver: GroupResolver = {
      resolveGroup(groupId: string): Promise<string[]> {
        return Promise.resolve([]);
      },
    };

    const api: NotificationAPI = new NotificationService();
    await api.projectAssigned(sender, resolver, assigner, project);
  });

  it(", if the assignee is a group, is sent to all group members", async () => {
    const assigner = "alice";
    const friends = ["bob", "charlie", "damian"];

    const project: Project = {
      id: "test project",
      status: "open",
      displayName: "my test project",
      assignee: "friends",
    };

    const callSpy = [0];
    const sender: Sender = {
      send(message: Event, recipient: string): Promise<void> {
        ++callSpy[0];
        assert.oneOf(recipient, friends);
        return Promise.resolve();
      },
    };

    const resolver: GroupResolver = {
      resolveGroup(groupId: string): Promise<string[]> {
        return Promise.resolve(groupId === "friends" ? friends : []);
      },
    };

    const api: NotificationAPI = new NotificationService();
    await api.projectAssigned(sender, resolver, assigner, project);

    // Make sure the sender has actually been invoked:
    assert.equal(callSpy[0], 3);
  });

  it(", if the assignee is a group, is never sent to the creator", async () => {
    const assigner = "alice";
    const friends = ["alice", "bob", "charlie", "damian"];
    // All friends except Alice receive a notification:
    const expectedRecipients = ["bob", "charlie", "damian"];

    const project: Project = {
      id: "test project",
      status: "open",
      displayName: "my test project",
      assignee: "friends",
    };

    const callSpy = [0];
    const sender: Sender = {
      send(message: Event, recipient: string): Promise<void> {
        ++callSpy[0];
        assert.oneOf(recipient, expectedRecipients);
        return Promise.resolve();
      },
    };

    const resolver: GroupResolver = {
      resolveGroup(groupId: string): Promise<string[]> {
        return Promise.resolve(groupId === "friends" ? friends : []);
      },
    };

    const api: NotificationAPI = new NotificationService();
    await api.projectAssigned(sender, resolver, assigner, project);

    // Make sure the sender has actually been invoked:
    assert.equal(callSpy[0], 3);
  });
});
