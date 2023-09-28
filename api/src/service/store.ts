/* eslint-disable no-unreachable */
import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { StreamKind } from "./Client.h";

interface PublishableData {
  stream: String;
  keys: String[];
  event: BusinessEvent;
  offchain?: Boolean;
}

export async function store(
  conn: ConnToken,
  ctx: Ctx,
  event: BusinessEvent,
  publisherAddress: String,
): Promise<void> {
  switch (event.type) {
    case "global_permission_granted":
    case "global_permission_revoked":
      await ensureStreamExists(conn, ctx, "global", "global");
      return writeTo(
        conn,
        ctx,
        { stream: "global", keys: ["permissions"], event },
        publisherAddress,
      );

    case "group_created":
      await ensureStreamExists(conn, ctx, "groups", "groups");
      return writeTo(
        conn,
        ctx,
        { stream: "groups", keys: [event.group.id], event },
        publisherAddress,
      );

    case "group_member_added":
    case "group_member_removed":
      return writeTo(
        conn,
        ctx,
        { stream: "groups", keys: [event.groupId], event },
        publisherAddress,
      );

    case "user_created":
      await ensureStreamExists(conn, ctx, "users", "users");
      return writeTo(
        conn,
        ctx,
        { stream: "users", keys: [event.user.id], event },
        publisherAddress,
      );

    case "project_created":
      const streamName = event.project.id;
      await ensureStreamExists(conn, ctx, streamName, "project");
      return writeTo(conn, ctx, { stream: streamName, keys: ["self"], event }, publisherAddress);

    case "project_updated":
    case "project_assigned":
    case "project_closed":
    case "project_permission_granted":
    case "project_permission_revoked":
    case "project_projected_budget_updated":
    case "project_projected_budget_deleted":
      return writeTo(
        conn,
        ctx,
        { stream: event.projectId, keys: ["self"], event },
        publisherAddress,
      );

    case "subproject_created":
      return writeTo(
        conn,
        ctx,
        {
          stream: event.projectId,
          keys: ["subprojects", event.subproject.id],
          event,
        },
        publisherAddress,
      );

    case "subproject_assigned":
    case "subproject_closed":
    case "subproject_updated":
    case "subproject_permission_granted":
    case "subproject_permission_revoked":
    case "subproject_projected_budget_updated":
    case "subproject_projected_budget_deleted":
      return writeTo(
        conn,
        ctx,
        {
          stream: event.projectId,
          keys: ["subprojects", event.subprojectId],
          event,
        },
        publisherAddress,
      );

    case "user_enabled":
    case "user_disabled":
    case "user_password_changed":
      return writeTo(
        conn,
        ctx,
        {
          stream: "users",
          keys: [event.user.id],
          event,
        },
        publisherAddress,
      );

    case "user_permission_granted":
    case "user_permission_revoked":
      return writeTo(
        conn,
        ctx,
        {
          stream: "users",
          keys: [event.userId],
          event,
        },
        publisherAddress,
      );

    case "workflowitems_reordered":
      return writeTo(
        conn,
        ctx,
        {
          stream: event.projectId,
          keys: [`${event.subprojectId}_workflowitem_ordering`],
          event,
        },
        publisherAddress,
      );

    case "workflowitem_created":
      return writeTo(
        conn,
        ctx,
        {
          stream: event.projectId,
          keys: [`${event.subprojectId}_workflows`, event.workflowitem.id],
          event,
        },
        publisherAddress,
      );

    case "workflowitem_assigned":
    case "workflowitem_closed":
    case "workflowitem_permission_granted":
    case "workflowitem_permission_revoked":
    case "workflowitem_updated":
      return writeTo(
        conn,
        ctx,
        {
          stream: event.projectId,
          keys: [`${event.subprojectId}_workflows`, event.workflowitemId],
          event,
        },
        publisherAddress,
      );

    case "document_uploaded":
      await ensureStreamExists(conn, ctx, "documents", "documents");
      return writeTo(
        conn,
        ctx,
        {
          stream: "documents",
          keys: [event.docId],
          event,
        },
        publisherAddress,
      );
      break;
    case "storage_service_url_published":
      await ensureStreamExists(conn, ctx, "documents", "documents");
      return writeTo(
        conn,
        ctx,
        {
          stream: "documents",
          keys: [event.organization],
          event,
        },
        publisherAddress,
      );
      break;

    case "secret_published":
      await ensureStreamExists(conn, ctx, "documents", "documents");
      return writeTo(
        conn,
        ctx,
        {
          stream: "documents",
          keys: [event.docId, event.organization],
          event,
        },
        publisherAddress,
      );
      break;
    case "workflowitem_document_validated":
      return writeTo(
        conn,
        ctx,
        {
          stream: event.projectId,
          keys: [`${event.subprojectId}_workflows`, event.workflowitemId],
          event,
        },
        publisherAddress,
      );

    case "notification_created":
      await ensureStreamExists(conn, ctx, "notifications", "notifications");
      return writeTo(
        conn,
        ctx,
        { stream: "notifications", keys: [event.recipient], event },
        publisherAddress,
      );

    case "notification_marked_read":
      return writeTo(
        conn,
        ctx,
        { stream: "notifications", keys: [event.recipient], event },
        publisherAddress,
      );

    case "public_key_published":
      await ensureStreamExists(conn, ctx, "public_keys", "public_keys");
      return writeTo(
        conn,
        ctx,
        { stream: "public_keys", keys: [event.organization], event },
        publisherAddress,
      );

    case "public_key_updated":
      return writeTo(
        conn,
        ctx,
        { stream: "public_keys", keys: [event.organization], event },
        publisherAddress,
      );

    case "provisioning_started":
      await ensureStreamExists(conn, ctx, "system_information", "system_information");
      return writeTo(
        conn,
        ctx,
        {
          stream: "system_information",
          keys: [event.type, event.time],
          event,
        },
        publisherAddress,
      );

    case "provisioning_ended":
      await ensureStreamExists(conn, ctx, "system_information", "system_information");
      return writeTo(
        conn,
        ctx,
        {
          stream: "system_information",
          keys: [event.type, event.time],
          event,
        },
        publisherAddress,
      );

    default:
      return Promise.reject(Error(`Not implemented: store(${JSON.stringify(event)})`));
  }
}

async function ensureStreamExists(
  conn: ConnToken,
  ctx: Ctx,
  name: string,
  kind: StreamKind,
): Promise<void> {
  return conn.multichainClient.getOrCreateStream({
    kind: kind,
    name: name,
  });
}

async function writeTo(
  conn: ConnToken,
  ctx: Ctx,
  { stream, keys, event }: PublishableData,
  publisherAddress: String,
  offchain?: Boolean,
): Promise<void> {
  const streamitem = { json: event };
  logger.debug({ ctx }, `Publishing ${event.type} to ${stream}/${keys}`);
  await conn.multichainClient
    .getRpcClient()
    .invokePublish(stream, keys, streamitem, publisherAddress, offchain ? offchain : false);
}
