import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as SnapshotService from "../../cache_snapshot";
import { ConnToken } from "../../conn";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";

import { createEvent } from "./workflowitem_snapshot_published";

const STREAM_BLACKLIST = [
  // The organization address is written directly (i.e., not as event):
  "organization",
];

export async function publishWorkflowitemSnapshot(
  ctx: Ctx,
  conn: ConnToken,
  streamName: string,
  workflowitemId: string,
  creatingUser: ServiceUser,
): Promise<{ canPublish: boolean; eventData: Result.Type<BusinessEvent> }> {
  return await SnapshotService.publishSnapshot(
    ctx,
    conn,
    streamName,
    workflowitemId,
    "workflowitem_snapshot_published",
    creatingUser,
    createEvent,
  );
}
