import { encryptWithKey } from "../lib/asymmetricCrypto";
import { BusinessEvent } from "../service/domain/business_event";
import * as DocumentGet from "../service/domain/document/document_get";
import * as DocumentUpload from "../service/domain/document/document_upload";
import * as GroupQuery from "../service/domain/organization/group_query";
import * as UserQuery from "../service/domain/organization/user_query";
import * as Workflowitem from "../service/domain/workflow/workflowitem";
import * as TypeEvents from "../service/domain/workflowitem_types/apply_workflowitem_type";
import * as PublicKeyGet from "../service/public_key_get";
import * as WorkflowitemCacheHelper from "../service/workflowitem_cache_helper";
import * as SubprojectCacheHelper from "../service/subproject_cache_helper";
import * as ProjectCacheHelper from "../service/project_cache_helper";
import * as Result from "../result";

// export interface Repository {
//   getWorkflowitem(workflowitemId: Workflowitem.Id): Promise<Result.Type<Workflowitem.Workflowitem>>;
//   getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
//   applyWorkflowitemType(
//     event: BusinessEvent,
//     workflowitem: Workflowitem.Workflowitem,
//   ): Result.Type<BusinessEvent[]>;
//   uploadDocumentToStorageService(
//     fileName: string,
//     documentBase64: string,
//     id: string,
//   ): Promise<Result.Type<BusinessEvent[]>>;
//   getAllDocumentReferences(): Promise<Result.Type<GenericDocument[]>>;
// }

export const getWorkflowitem =
  (conn, ctx, projectId) =>
  async (id: string): Promise<Result.Type<Workflowitem.Workflowitem>> => {
    return WorkflowitemCacheHelper.getWorkflowitem(conn, ctx, projectId, id);
  };
export const getUsersForIdentity = (conn, ctx, serviceUser) => async (identity) => {
  return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
};
export const applyWorkflowitemType =
  (ctx, serviceUser) => (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
    return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
  };
export const uploadDocumentToStorageService =
  (conn, ctx, serviceUser, storageServiceClient, cache) => (fileName, documentBase64, id) => {
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
  };

export const getAllDocumentReferences = (conn, ctx, cache) => async () => {
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
      return WorkflowitemCacheHelper.getAllWorkflowitems(conn, ctx, projectId, subprojectId);
    },
  });
};

// export const updateWorkflowItemRepository = (
//   conn: ConnToken,
//   storageServiceClient: StorageServiceClientI,
//   ctx: Ctx,
//   serviceUser: ServiceUser,
//   projectId: Project.Id,
//   subprojectId: Subproject.Id,
//   workflowitemId: Workflowitem.Id,
//   modification: WorkflowitemUpdate.RequestData,
//   cache,
// ): Repository => ({
//   getWorkflowitem: async (id: string): Promise<Result.Type<Workflowitem.Workflowitem>> => {
//     return WorkflowitemCacheHelper.getWorkflowitem(conn, ctx, projectId, id);
//   },
//   getUsersForIdentity: async (identity) => {
//     return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
//   },
//   applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
//     return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
//   },
//   uploadDocumentToStorageService: (fileName, documentBase64, id) => {
//     return DocumentUpload.uploadDocument(
//       ctx,
//       serviceUser,
//       { fileName, documentBase64, id },
//       {
//         getAllDocumentReferences: async () => {
//           return DocumentGet.getAllDocumentReferences({
//             getDocumentsEvents: async () => {
//               return cache.getDocumentUploadedEvents();
//             },
//             getAllProjects: async () => {
//               return ProjectCacheHelper.getAllProjects(conn, ctx);
//             },
//             getAllSubprojects: async (projectId) => {
//               return SubprojectCacheHelper.getAllSubprojects(conn, ctx, projectId);
//             },
//             getAllWorkflowitems: async (projectId, subprojectId) => {
//               return WorkflowitemCacheHelper.getAllWorkflowitems(
//                 conn,
//                 ctx,
//                 projectId,
//                 subprojectId,
//               );
//             },
//           });
//         },
//         storeDocument: async (id, name, hash) => {
//           return storageServiceClient.uploadObject(id, name, hash);
//         },
//         getPublicKey: async (organization) => {
//           return PublicKeyGet.getPublicKey(conn, ctx, organization);
//         },
//         encryptWithKey: async (secret, publicKey) => {
//           return encryptWithKey(secret, publicKey);
//         },
//         getUser: (userId) => UserQuery.getUser(conn, ctx, serviceUser, userId),
//       },
//     );
//   },
//   getAllDocumentReferences: async () => {
//     return DocumentGet.getAllDocumentReferences({
//       getDocumentsEvents: async () => {
//         return cache.getDocumentUploadedEvents();
//       },
//       getAllProjects: async () => {
//         return ProjectCacheHelper.getAllProjects(conn, ctx);
//       },
//       getAllSubprojects: async (projectId) => {
//         return SubprojectCacheHelper.getAllSubprojects(conn, ctx, projectId);
//       },
//       getAllWorkflowitems: async (projectId, subprojectId) => {
//         return WorkflowitemCacheHelper.getAllWorkflowitems(conn, ctx, projectId, subprojectId);
//       },
//     });
//   },
// });
