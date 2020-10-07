import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";

interface PublishableData {
  stream: String;
  keys: String[];
  event: BusinessEvent;
  offchain?: Boolean;
}

export async function store(conn: ConnToken, ctx: Ctx, event: BusinessEvent): Promise<void> {
  switch (event.type) {
    case "global_permission_granted":
    case "global_permission_revoked":
      await ensureStreamExists(conn, ctx, "global", "global");
      return writeTo(conn, ctx, { stream: "global", keys: ["permissions"], event });

    case "group_created":
      await ensureStreamExists(conn, ctx, "groups", "groups");
      return writeTo(conn, ctx, { stream: "groups", keys: [event.group.id], event });

    case "group_member_added":
    case "group_member_removed":
      return writeTo(conn, ctx, { stream: "groups", keys: [event.groupId], event });

    case "user_created":
      await ensureStreamExists(conn, ctx, "users", "users");
      return writeTo(conn, ctx, { stream: "users", keys: [event.user.id], event });

    case "project_created":
      const streamName = event.project.id;
      await ensureStreamExists(conn, ctx, streamName, "project");
      return writeTo(conn, ctx, { stream: streamName, keys: ["self"], event });

    case "project_updated":
    case "project_assigned":
    case "project_closed":
    case "project_permission_granted":
    case "project_permission_revoked":
    case "project_projected_budget_updated":
    case "project_projected_budget_deleted":
      return writeTo(conn, ctx, { stream: event.projectId, keys: ["self"], event });

    case "subproject_created":
      return writeTo(conn, ctx, {
        stream: event.projectId,
        keys: ["subprojects", event.subproject.id],
        event,
      });

    case "subproject_assigned":
    case "subproject_closed":
    case "subproject_updated":
    case "subproject_permission_granted":
    case "subproject_permission_revoked":
    case "subproject_projected_budget_updated":
    case "subproject_projected_budget_deleted":
      return writeTo(conn, ctx, {
        stream: event.projectId,
        keys: ["subprojects", event.subprojectId],
        event,
      });

    case "user_enabled":
    case "user_disabled":
    case "user_password_changed":
      return writeTo(conn, ctx, {
        stream: "users",
        keys: [event.user.id],
        event,
      });

    case "user_permission_granted":
    case "user_permission_revoked":
      return writeTo(conn, ctx, {
        stream: "users",
        keys: [event.userId],
        event,
      });

    case "workflowitems_reordered":
      return writeTo(conn, ctx, {
        stream: event.projectId,
        keys: [`${event.subprojectId}_workflowitem_ordering`],
        event,
      });

    case "workflowitem_created":
      return writeTo(conn, ctx, {
        stream: event.projectId,
        keys: [`${event.subprojectId}_workflows`, event.workflowitem.id],
        event,
      });

    case "workflowitem_assigned":
    case "workflowitem_closed":
    case "workflowitem_permission_granted":
    case "workflowitem_permission_revoked":
    case "workflowitem_updated":
      return writeTo(conn, ctx, {
        stream: event.projectId,
        keys: [`${event.subprojectId}_workflows`, event.workflowitemId],
        event,
      });

    case "workflowitem_document_uploaded":
      await ensureStreamExists(conn, ctx, "offchain_documents", "offchain_documents");
      return writeTo(
        conn,
        ctx,
        {
          stream: "offchain_documents",
          keys: [event.document.id],
          event,
        },
        true,
      );
      break;

    case "notification_created":
      await ensureStreamExists(conn, ctx, "notifications", "notifications");
      return writeTo(conn, ctx, { stream: "notifications", keys: [event.recipient], event });

    case "notification_marked_read":
      return writeTo(conn, ctx, { stream: "notifications", keys: [event.recipient], event });

    default:
      return Promise.reject(Error(`Not implemented: store(${JSON.stringify(event)})`));
  }
}

async function ensureStreamExists(conn: ConnToken, ctx: Ctx, name: string, kind: string) {
  const isPublic = true; // in multichain terms: isOpen
  const customFields = { kind };
  await conn.multichainClient
    .getRpcClient()
    .invoke("create", "stream", name, isPublic, customFields)
    .then(() => logger.debug({ ctx }, `New ${kind} stream created: ${name}`))
    .catch((err) => {
      if (err && err.code === -705) {
        // Code -705 means the stream already exists - that's fine.
        return;
      }
      return new VError(err, `could not create ${kind} stream "${name}"`);
    });
}

async function writeTo(
  conn: ConnToken,
  ctx: Ctx,
  { stream, keys, event }: PublishableData,
  offchain?: Boolean,
) {
  const streamitem = { json: event };
  logger.debug({ ctx }, `Publishing ${event.type} to ${stream}/${keys}`);
  // TODO publishfrom address
  await conn.multichainClient
    .getRpcClient()
    .invoke("publish", stream, keys, streamitem, offchain ? "offchain" : "");
}
