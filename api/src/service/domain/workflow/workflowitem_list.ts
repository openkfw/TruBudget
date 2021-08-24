import { VError } from "verror";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotFound } from "../errors/not_found";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import { sortWorkflowitems } from "./workflowitem_ordering";
import * as WorkflowitemDocument from "../document/document";

interface Repository {
  getWorkflowitems(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
  getWorkflowitemOrdering(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Workflowitem.Id[]>>;
  downloadDocument(
    workflowitemId: string,
    docId: string,
  ): Promise<Result.Type<WorkflowitemDocument.UploadedDocument>>;
}

export async function getAllVisible(
  ctx: Ctx,
  user: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  repository: Repository,
): Promise<Result.Type<Workflowitem.ScrubbedWorkflowitem[]>> {
  const workflowitems = await repository.getWorkflowitems(projectId, subprojectId);
  if (Result.isErr(workflowitems)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  const workflowitemOrdering = await repository.getWorkflowitemOrdering(projectId, subprojectId);
  if (Result.isErr(workflowitemOrdering)) {
    return new VError(
      workflowitemOrdering,
      `failed to resolve workflowitem ordering for project=${projectId}/subproject=${subprojectId}`,
    );
  }

  const sortedWorkflowitems = sortWorkflowitems(workflowitems, workflowitemOrdering);

  const visibleWorkflowitems = sortedWorkflowitems
    // Redact workflowitems the user is not entitled to see:
    .map((item) =>
      user.id === "root" || Workflowitem.permits(item, user, ["workflowitem.view"])
        ? item
        : Workflowitem.redact(item),
    )
    // Only keep history event the user may see and remove all others:
    .map((item) => (item.isRedacted ? item : { ...item, log: traceEventsVisibleTo(item, user) }));

  const workflowitemsWithDocAvailability = await Promise.all(
    visibleWorkflowitems.map(async (item) =>
      item.documents.length > 0
        ? ({
            ...item,
            documents: await setDocumentAvailability(item, repository),
          } as Workflowitem.ScrubbedWorkflowitem)
        : item,
    ),
  );
  return workflowitemsWithDocAvailability;
}

type EventType = string;
const requiredPermissions = new Map<EventType, Intent[]>([
  ["workflowitem_created", ["workflowitem.view"]],
  ["workflowitem_permission_granted", ["workflowitem.intent.listPermissions"]],
  ["workflowitem_permission_revoked", ["workflowitem.intent.listPermissions"]],
  ["workflowitem_assigned", ["workflowitem.view"]],
  ["workflowitem_updated", ["workflowitem.view"]],
  ["workflowitem_closed", ["workflowitem.view"]],
  ["workflowitems_reordered", ["workflowitem.view"]],
]);

async function setDocumentAvailability(
  item,
  repository: Repository,
): Promise<WorkflowitemDocument.StoredDocument[]> {
  const docsWithAvailability: WorkflowitemDocument.StoredDocument[] = [];
  const docs = item.documents;
  for (const doc of docs) {
    const result = await repository.downloadDocument(item.id, doc.id);
    Result.isOk(result)
      ? docsWithAvailability.push({ ...doc, available: true })
      : docsWithAvailability.push({ ...doc, available: false });
  }
  return docsWithAvailability;
}

function traceEventsVisibleTo(workflowitem: Workflowitem.Workflowitem, user: ServiceUser) {
  const traceEvents = workflowitem.log;
  return traceEvents.filter((traceEvent) => {
    if (user.id === "root") {
      return true;
    }

    const whitelist = requiredPermissions.get(traceEvent.businessEvent.type);
    if (!whitelist) {
      return false;
    }

    const eligibleIdentities = new Set(
      whitelist.reduce(
        (acc, intent) => acc.concat(workflowitem.permissions[intent] || []),
        [] as string[],
      ),
    );

    return [...eligibleIdentities.values()].some((identity) => canAssumeIdentity(user, identity));
  });
}
