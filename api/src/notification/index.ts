import { Event } from "../multichain/event";

export interface Project {
  id: string;
  status: "open" | "closed";
  displayName: string;
  assignee: string;
}

export interface NotificationAPI {
  /**
   * Selects assignees and sends notification(s) to a given backend.
   */
  projectAssigned(
    sender: Sender,
    resolver: GroupResolverPort,
    assigner: string,
    project: Project,
  ): Promise<void>;
}

export type Sender = (message: Event, recipient: string) => Promise<void>;

/**
 * Returns the members for a given group.
 *
 * If the group does not exist, an empty array is returned.
 */
export type GroupResolverPort = (groupId: string) => Promise<string[]>;

export class NotificationService implements NotificationAPI {
  public async projectAssigned(
    send: Sender,
    resolveGroup: GroupResolverPort,
    assigner: string,
    project: Project,
  ): Promise<void> {
    const assignee = project.assignee;
    const groupMembers = await resolveGroup(assignee);
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
      await send(event, recipient);
    }
  }
}
