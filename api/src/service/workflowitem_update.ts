import logger from "lib/logger";
import { VError } from "verror";
import { config } from "../config";
import { encryptWithKey } from "../lib/asymmetricCrypto";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { StorageServiceClientI } from "./Client_storage_service.h";
import { ConnToken } from "./conn";
import * as DocumentShare from "./document_share";
import { BusinessEvent } from "./domain/business_event";
import * as DocumentGet from "./domain/document/document_get";
import * as DocumentUpload from "./domain/document/document_upload";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserQuery from "./domain/organization/user_query";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemUpdate from "./domain/workflow/workflowitem_update";
import * as TypeEvents from "./domain/workflowitem_types/apply_workflowitem_type";
import * as PublicKeyGet from "./public_key_get";
import * as WorkflowitemSnapshotPublish from "./domain/workflow/workflowitem_snapshot_publish";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import * as ProjectCacheHelper from "./project_cache_helper";
import { store } from "./store";

export type RequestData = WorkflowitemUpdate.RequestData;

export async function updateWorkflowitem(
  conn: ConnToken,
  storageServiceClient: StorageServiceClientI,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  modification: WorkflowitemUpdate.RequestData,
): Promise<Result.Type<void>> {
  const updateWorkflowitemResult = await Cache.withCache(conn, ctx, async (cache) => {
    logger.debug(
      { projectId, subprojectId, workflowitemId, modification },
      "Updating workflowitem",
    );
    return WorkflowitemUpdate.updateWorkflowitem(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        getWorkflowitem: async (id) => {
          return WorkflowitemCacheHelper.getWorkflowitem(conn, ctx, projectId, id);
        },
        getUsersForIdentity: async (identity) => {
          return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
        },
        applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
          return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
        },
        uploadDocumentToStorageService: (fileName, documentBase64, id) => {
          return DocumentUpload.uploadDocument(
            ctx,
            serviceUser,
            { fileName, documentBase64, id },
            {
              getAllDocumentReferences: async () => {
                return DocumentGet.getAllDocumentReferences({
                  getDocumentsEvents: async () => {
                    return cache.getDocumentUploadedEvents();
                  },
                  getAllProjects: async () => {
                    return ProjectCacheHelper.getAllProjects(conn, ctx);
                  },
                  getAllSubprojects: async (projectId) => {
                    return SubprojectCacheHelper.getAllSubprojects(conn, ctx, projectId);
                  },
                  getAllWorkflowitems: async (projectId, subprojectId) => {
                    return WorkflowitemCacheHelper.getAllWorkflowitems(
                      conn,
                      ctx,
                      projectId,
                      subprojectId,
                    );
                  },
                });
              },
              storeDocument: async (id, name, hash) => {
                return storageServiceClient.uploadObject(id, name, hash);
              },
              getPublicKey: async (organization) => {
                return PublicKeyGet.getPublicKey(conn, ctx, organization);
              },
              encryptWithKey: async (secret, publicKey) => {
                return encryptWithKey(secret, publicKey);
              },
              getUser: (userId) => UserQuery.getUser(conn, ctx, serviceUser, userId),
            },
          );
        },
        getAllDocumentReferences: async () => {
          return DocumentGet.getAllDocumentReferences({
            getDocumentsEvents: async () => {
              return cache.getDocumentUploadedEvents();
            },
            getAllProjects: async () => {
              return ProjectCacheHelper.getAllProjects(conn, ctx);
            },
            getAllSubprojects: async (projectId) => {
              return SubprojectCacheHelper.getAllSubprojects(conn, ctx, projectId);
            },
            getAllWorkflowitems: async (projectId, subprojectId) => {
              return WorkflowitemCacheHelper.getAllWorkflowitems(
                conn,
                ctx,
                projectId,
                subprojectId,
              );
            },
          });
        },
      },
    );
  });
  if (Result.isErr(updateWorkflowitemResult)) {
    return new VError(updateWorkflowitemResult, "update workflowitem failed");
  }
  const { newEvents } = updateWorkflowitemResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  const { canPublish, eventData } = await WorkflowitemSnapshotPublish.publishWorkflowitemSnapshot(
    ctx,
    conn,
    projectId,
    workflowitemId,
    serviceUser,
  );
  if (canPublish) {
    if (Result.isErr(eventData)) {
      return new VError(eventData, "update workflowitem snapshot failed");
    }
    const publishEvent = eventData;
    await store(conn, ctx, publishEvent, serviceUser.address);
  }

  const workflowitem = await WorkflowitemCacheHelper.getWorkflowitem(
    conn,
    ctx,
    projectId,
    workflowitemId,
  );

  if (Result.isErr(workflowitem)) {
    return new VError(workflowitem, `failed to get workflowitem ${workflowitemId}`);
  }

  if (
    config.documentFeatureEnabled &&
    modification.documents &&
    modification.documents.length > 0
  ) {
    for (const doc of modification.documents) {
      const users = workflowitem.permissions["workflowitem.list"];
      if (users) {
        const organizations = await getOrganizations(users);

        if (Result.isErr(organizations)) {
          return new VError(organizations, "failed to get organizations");
        }

        for (const organization of organizations) {
          const event = await DocumentShare.documentShare(conn, ctx, serviceUser, {
            organization,
            docId: doc.id,
            projectId,
            subprojectId,
            workflowitemId,
          });
          if (Result.isErr(event)) {
            return new VError(event, "failed to share document");
          }
        }
      }
    }
  }

  async function getOrganizations(users: string[]): Promise<Result.Type<string[]>> {
    logger.debug("Gathering Organizations based on users");
    const organizations: string[] = [];
    for (const userId of users) {
      // check if grantee is user, get the user's organization
      if (await UserQuery.userExists(conn, ctx, serviceUser, userId)) {
        const user = await UserQuery.getUser(conn, ctx, serviceUser, userId);
        if (Result.isErr(user)) {
          return new VError(user, "failed to get user");
        }
        const { organization } = user;
        organizations.push(organization);

        // check if grantee is group, get the organizations of all group members
      } else if (await GroupQuery.groupExists(conn, ctx, serviceUser, userId)) {
        const group = await GroupQuery.getGroup(conn, ctx, serviceUser, userId);
        if (Result.isErr(group)) {
          return new VError(group, "failed to get group");
        }
        const { members } = group;
        for (const member of members) {
          const user = await UserQuery.getUser(conn, ctx, serviceUser, member);
          if (Result.isErr(user)) {
            return new VError(user, "failed to get group member");
          }
          const { organization } = user;
          organizations.push(organization);
        }
      }
    }

    return organizations;
  }
}
