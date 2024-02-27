import { VError } from "verror";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { DocumentOrExternalLinkReference, StoredDocument } from "./document";
import { processDocumentEvents } from "./document_eventsourcing";
import * as Project from "../workflow/project";
import * as Subproject from "../workflow/subproject";
import * as Workflowitem from "../workflow/workflowitem";
import logger from "lib/logger";

interface Repository {
  getDocumentsEvents(): Promise<Result.Type<BusinessEvent[]>>;
  getAllProjects(): Promise<Project.Project[]>;
  getAllSubprojects(projectId: Project.Id): Promise<Result.Type<Subproject.Subproject[]>>;
  getAllWorkflowitems(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
}

export async function getAllDocumentInfos(
  ctx: Ctx,
  repository: Repository,
): Promise<Result.Type<StoredDocument[]>> {
  logger.trace("Getting all document infos");
  const documentEvents = await repository.getDocumentsEvents();

  if (Result.isErr(documentEvents)) {
    return new VError(documentEvents, "fetch storage documents events failed");
  }

  const { documents } = processDocumentEvents(ctx, documentEvents);
  return documents;
}

export async function getDocumentInfo(
  ctx: Ctx,
  docId: string,
  repository: Repository,
): Promise<Result.Type<StoredDocument | undefined>> {
  logger.trace({ docId }, "Getting infos of document by id");
  const documentInfos = await getAllDocumentInfos(ctx, repository);

  if (Result.isErr(documentInfos)) {
    return new VError(documentInfos, "get all documents from storage failed");
  }

  const document = documentInfos.find((doc) => doc.id === docId);
  return document;
}

export async function getAllDocumentReferences(
  repository: Repository,
): Promise<Result.Type<DocumentOrExternalLinkReference[]>> {
  const projects: Project.Project[] = await repository.getAllProjects();
  let documentReferences: DocumentOrExternalLinkReference[] = [];
  for (const project of projects) {
    const allSubprojectsResult = await repository.getAllSubprojects(project.id);

    if (Result.isErr(allSubprojectsResult)) {
      return new VError(allSubprojectsResult, "couldn't get all subprojects");
    }
    const allSubprojects = allSubprojectsResult;
    for (const subproject of allSubprojects) {
      const workflowitems = await repository.getAllWorkflowitems(project.id, subproject.id);
      if (Result.isErr(workflowitems)) {
        return new VError(workflowitems, "couldn't get all workflowitems");
      }
      for (const workflowitem of workflowitems) {
        documentReferences.push(...workflowitem.documents);
      }
    }
  }
  return documentReferences;
}
