import { Event } from "../multichain/event";

export interface ProjectAssignment {
  projectId: string;
  actingUser: string;
  assignee?: string;
}

export interface ProjectUpdate {
  projectId: string;
  assignee?: string;
  actingUser: string;
  update: any;
}

export interface WorkflowitemClosing {
  workflowitemId: string;
  actingUser: string;
  assignee?: string;
}

export type Sender = (message: Event, recipient: string) => Promise<void>;

/**
 * Returns the members for a given group.
 *
 * If the group does not exist, an empty array is returned.
 */
export type GroupResolver = (groupId: string) => Promise<string[]>;

export async function projectAssigned(
  projectAssignment: ProjectAssignment,
  {
    send,
    resolveGroup,
  }: {
    send: Sender;
    resolveGroup: GroupResolver;
  },
): Promise<void> {
  const assignee = projectAssignment.assignee;
  if (assignee === undefined) return;
  const groupMembers = await resolveGroup(assignee);
  const resolvedAssignees = groupMembers.length ? groupMembers : [assignee];
  const recipients = resolvedAssignees.filter(x => x !== projectAssignment.actingUser);

  const event: Event = {
    key: projectAssignment.projectId,
    intent: "project.assign",
    createdBy: projectAssignment.actingUser,
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

export async function projectUpdated(
  projectUpdate: ProjectUpdate,
  {
    send,
    resolveGroup,
  }: {
    send: Sender;
    resolveGroup: GroupResolver;
  },
): Promise<void> {
  const assignee = projectUpdate.assignee;
  if (assignee === undefined) return;
  const groupMembers = await resolveGroup(assignee);
  const resolvedAssignees = groupMembers.length ? groupMembers : [assignee];
  const recipients = resolvedAssignees.filter(x => x !== projectUpdate.actingUser);

  const event: Event = {
    key: projectUpdate.projectId,
    intent: "project.update",
    createdBy: projectUpdate.actingUser,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: projectUpdate.update,
  };

  for (const recipient of recipients) {
    await send(event, recipient);
  }
}

export async function workflowitemClosed(
  workflowitemClose: WorkflowitemClosing,
  {
    sender,
    resolver,
  }: {
    sender: Sender;
    resolver: GroupResolver;
  },
): Promise<void> {
  const assignee = workflowitemClose.assignee;
  if (assignee === undefined) return;

  const groupMembers = await resolver(assignee);
  const resolvedAssignees = groupMembers.length ? groupMembers : [assignee];
  const recipients = resolvedAssignees.filter(x => x !== workflowitemClose.actingUser);

  const event: Event = {
    key: workflowitemClose.workflowitemId,
    intent: "workflowitem.close",
    createdBy: workflowitemClose.actingUser,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: {},
  };

  for (const recipient of recipients) {
    await sender(event, recipient);
  }
}
