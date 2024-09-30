import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as SnapshotService from "../../cache_snapshot";
import { ConnToken } from "../../conn";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";

import { createEvent } from "./subproject_snapshot_published";
import { WorkflowitemOrdering } from "./workflowitem_ordering";

const STREAM_BLACKLIST = [
  // The organization address is written directly (i.e., not as event):
  "organization",
];

export async function publishSubprojectSnapshot(
  ctx: Ctx,
  conn: ConnToken,
  streamName: string,
  subprojectId: string,
  creatingUser: ServiceUser,
  ordering?: WorkflowitemOrdering,
): Promise<{ canPublish: boolean; eventData: Result.Type<BusinessEvent> }> {
  return await SnapshotService.publishSnapshot(
    ctx,
    conn,
    streamName,
    subprojectId,
    "subproject_snapshot_published",
    creatingUser,
    createEvent,
    ordering,
  );
}
