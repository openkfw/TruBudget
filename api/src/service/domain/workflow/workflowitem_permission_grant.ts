import isEqual = require("lodash.isequal");

import { VError } from "verror";
import Intent from "../../../authz/intents";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as Group from "../organization/group";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemEventSourcing from "./workflowitem_eventsourcing";
import * as WorkflowitemPermissionGranted from "./workflowitem_permission_granted";
import { config } from "../../../config";
import logger from "lib/logger";

interface Repository {
  getWorkflowitem(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    workflowitemId: Workflowitem.Id,
  ): Promise<Result.Type<Workflowitem.Workflowitem>>;
  userExists(user: Identity): Promise<Result.Type<boolean>>;
  getUser(user: Identity): Promise<Result.Type<UserRecord.UserRecord>>;
  shareDocument(id: string, organization: string): Promise<Result.Type<BusinessEvent | undefined>>;
  groupExists(group: Identity): Promise<Result.Type<boolean>>;
  getGroup(group: Identity): Promise<Result.Type<Group.Group>>;
}

export async function grantWorkflowitemPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  grantee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const workflowitem = await repository.getWorkflowitem(projectId, subprojectId, workflowitemId);
  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  logger.trace(
    { issuer, grantee, intent, projectId, subprojectId, workflowitemId },
    "Creating workflowitem_permission_grantet event",
  );
  const permissionGrantedEventResult = WorkflowitemPermissionGranted.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
    intent,
    grantee,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(permissionGrantedEventResult)) {
    return new VError(permissionGrantedEventResult, "failed to create permission granted event");
  }
  const permissionGrantedEvent = permissionGrantedEventResult;

  logger.trace({ issuer }, "Checking if user has permissions");
  if (issuer.id !== "root") {
    const grantIntent = "workflowitem.intent.grantPermission";
    if (!Workflowitem.permits(workflowitem, issuer, [grantIntent])) {
      return new NotAuthorized({
        ctx,
        userId: issuer.id,
        intent: grantIntent,
        target: workflowitem,
      });
    }
  }

  logger.trace({ event: permissionGrantedEvent }, "Checking event validity");
  const updatedWorkflowitem = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitem,
    permissionGrantedEvent,
  );
  if (Result.isErr(updatedWorkflowitem)) {
    return new InvalidCommand(ctx, permissionGrantedEvent, [updatedWorkflowitem]);
  }

  logger.trace("Check document access for users of new organizations");
  const { documents } = workflowitem;
  const documentEvents: BusinessEvent[] = [];

  if (config.documentFeatureEnabled) {
    const organizations = await getOrganizations(repository, grantee);
    if (Result.isErr(organizations)) {
      return new VError(organizations, "failed to get organization for sharing documents");
    }

    logger.trace("Share all documents with all organizations");
    for (const organization of organizations) {
      for (const doc of documents) {
        const shareDocumentEventResult = await repository.shareDocument(doc.id, organization);
        if (Result.isErr(shareDocumentEventResult)) {
          return new VError(
            shareDocumentEventResult,
            `failed to share Document ${doc.id} to organization ${organization}`,
          );
        }
        if (shareDocumentEventResult) {
          documentEvents.push(shareDocumentEventResult);
        }
      }
    }
  }

  // Only emit the event if it causes any changes to the permissions:
  if (isEqual(workflowitem.permissions, updatedWorkflowitem.permissions)) {
    return [];
  }

  return [permissionGrantedEvent, ...documentEvents];
}

async function getOrganizations(
  repository: Repository,
  grantee: string,
): Promise<Result.Type<string[]>> {
  const organizations: string[] = [];

  // check if grantee is user, get the user's organization
  if (await repository.userExists(grantee)) {
    const user = await repository.getUser(grantee);
    if (Result.isErr(user)) {
      return new VError(user, "failed to get user");
    }
    const { organization } = user;
    organizations.push(organization);

    // check if grantee is group, get the organizations of all group members
  } else if (await repository.groupExists(grantee)) {
    const group = await repository.getGroup(grantee);
    if (Result.isErr(group)) {
      return new VError(group, "failed to get group");
    }
    const { members } = group;
    for (const member of members) {
      const user = await repository.getUser(member);
      if (Result.isErr(user)) {
        return new VError(user, "failed to get group member");
      }
      const { organization } = user;
      organizations.push(organization);
    }
  }
  return organizations;
}
