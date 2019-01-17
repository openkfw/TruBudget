import { Event } from "../multichain/event";
import { Project } from "./Project";

export interface NotificationAPI {
  /**
   * Selects assignees and sends notification(s) to a given backend.
   */
  projectAssigned(
    sender: Sender,
    resolver: GroupResolver,
    assigner: string,
    project: Project,
  ): Promise<void>;
}

export interface Sender {
  /**
   * Forwards a message (without interpreting it).
   */
  send(message: Event, recipient: string): Promise<void>;
}

export interface GroupResolver {
  /**
   * Returns the members for a given group.
   *
   * If the group does not exist, an empty array is returned.
   */
  resolveGroup(groupId: string): Promise<string[]>;
}

export class NotificationService implements NotificationAPI {
  public async projectAssigned(
    sender: Sender,
    resolver: GroupResolver,
    assigner: string,
    project: Project,
  ): Promise<void> {
    const assignee = project.assignee;
    const groupMembers = await resolver.resolveGroup(assignee);
    const resolvedAssignees = groupMembers.length ? groupMembers : [assignee];
    const recipients = resolvedAssignees.filter(x => x !== assigner);

    const event: Event = {
      key: project.id,
      intent: "project.assign",
      createdBy: assigner,
      createdAt: new Date().toISOString(),
      dataVersion: 1,
      data: {
        identity: assignee,
      },
    };

    for (const recipient of recipients) {
      await sender.send(event, recipient);
    }
  }
}
