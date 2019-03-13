import logger from "../lib/logger";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";

export async function loadGlobalEvents(conn: ConnToken): Promise<BusinessEvent[]> {
  await Cache2.refresh(conn, "global");
  return conn.cache2.eventsByStream.get("global") || [];
}

export async function loadUserEvents(conn: ConnToken, userId?: string): Promise<BusinessEvent[]> {
  await Cache2.refresh(conn, "users");
  return conn.cache2.eventsByStream.get("users") || [];
}

export async function loadGroupEvents(conn: ConnToken): Promise<BusinessEvent[]> {
  await Cache2.refresh(conn, "groups");
  return conn.cache2.eventsByStream.get("groups") || [];
}

export async function loadNotificationEvents(
  conn: ConnToken,
  userId: string,
): Promise<BusinessEvent[]> {
  const userFilter = event => {
    if (!event.type.startsWith("notification_")) {
      logger.debug(`Unexpected event type in "notifications" stream: ${event.type}`);
      return false;
    }

    switch (event.type) {
      case "notification_created":
        return event.recipient === userId;
      case "notification_marked_read":
        return event.recipient === userId;
      default:
        throw Error(`not implemented: notification event of type ${event.type}`);
    }
  };

  await Cache2.refresh(conn, "notifications");
  return (conn.cache2.eventsByStream.get("notifications") || []).filter(userFilter);
}

export async function loadProjectEvents(
  conn: ConnToken,
  projectId?: string,
): Promise<BusinessEvent[]> {
  await Cache2.refresh(conn, projectId);
  if (projectId === undefined) {
    // Load events for all projects:
    const allEvents: BusinessEvent[] = [];
    for (const projectEvents of conn.cache2.eventsByStream.values()) {
      allEvents.push(...projectEvents);
    }
    return allEvents;
  } else {
    // Load events for a single project:
    return conn.cache2.eventsByStream.get(projectId) || [];
  }
}

export async function loadSubprojectEvents(
  conn: ConnToken,
  projectId: string,
  subprojectId?: string,
): Promise<BusinessEvent[]> {
  const subprojectFilter = event => {
    if (!event.type.startsWith("subproject_")) {
      return false;
    }

    if (subprojectId === undefined) {
      return true;
    }

    switch (event.type) {
      case "subproject_created":
        return event.subproject.id === subprojectId;
      case "subproject_updated":
        return event.subprojectId === subprojectId;
      case "subproject_assigned":
        return event.subprojectId === subprojectId;
      case "subproject_closed":
        return event.subprojectId === subprojectId;
      case "subproject_permission_granted":
        return event.subprojectId === subprojectId;
      case "subproject_permission_revoked":
        return event.subprojectId === subprojectId;
      case "subproject_projected_budget_updated":
        return event.subprojectId === subprojectId;
      case "subproject_projected_budget_deleted":
        return event.subprojectId === subprojectId;
      default:
        throw Error(`not implemented: notification event of type ${event.type}`);
    }
  };

  await Cache2.refresh(conn, projectId);
  return (conn.cache2.eventsByStream.get(projectId) || []).filter(subprojectFilter);
}
