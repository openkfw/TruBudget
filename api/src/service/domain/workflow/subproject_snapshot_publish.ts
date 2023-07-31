import { Ctx } from "../../../lib/ctx";
import { ConnToken } from "../../conn";
import { createEvent } from "./subproject_snapshot_published";
import * as Result from "../../../result";
import { ServiceUser } from "../organization/service_user";
import * as SnapshotService from "../../cache_snapshot";
import { BusinessEvent } from "../business_event";

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
): Promise<{ canPublish: boolean; eventData: Result.Type<BusinessEvent> }> {
  return await SnapshotService.publishSnapshot(
    ctx,
    conn,
    streamName,
    subprojectId,
    "subproject_snapshot_published",
    creatingUser,
    createEvent,
  );
}
