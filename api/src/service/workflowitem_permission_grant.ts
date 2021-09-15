import { VError } from "verror";
import Intent from "../authz/intents";
import { config } from "../config";
import { decryptWithKey, encryptWithKey } from "../lib/asymmetricCrypto";
import { Ctx } from "../lib/ctx";
import * as PrivateKeyGet from "../organization/organization";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as DocumentShare from "./domain/document/document_share";
import * as SecretGet from "./domain/document/secret_get";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemPermissionGrant from "./domain/workflow/workflowitem_permission_grant";
import * as GroupQuery from "./group_query";
import * as PublicKeyGet from "./public_key_get";
import { store } from "./store";
import * as UserQuery from "./user_query";

export { RequestData } from "./domain/workflow/project_create";

export async function grantWorkflowitemPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  grantee: Identity,
  intent: Intent,
): Promise<Result.Type<void>> {
  const newEventsResult = await Cache.withCache(conn, ctx, async (cache) =>
    WorkflowitemPermissionGrant.grantWorkflowitemPermission(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      workflowitemId,
      grantee,
      intent,
      {
        getWorkflowitem: async (pId, spId, wId) => {
          return await cache.getWorkflowitem(pId, spId, wId);
        },
        userExists: async (user) => UserQuery.userExists(conn, ctx, serviceUser, user),
        getUser: async (user) => UserQuery.getUser(conn, ctx, serviceUser, user),
        shareDocument: async (id, organization) =>
          DocumentShare.shareDocument(
            ctx,
            serviceUser,
            { docId: id, organization, projectId, subprojectId, workflowitemId },
            {
              encryptWithKey: async (secret, publicKey) => {
                return encryptWithKey(secret, publicKey);
              },
              decryptWithKey: async (secret, privateKey) => {
                return decryptWithKey(secret, privateKey);
              },
              getPublicKey: async (organization) => {
                return PublicKeyGet.getPublicKey(conn, ctx, organization);
              },
              getPrivateKey: async (organization) => {
                return PrivateKeyGet.getPrivateKey(
                  conn.multichainClient,
                  organization,
                  config.organizationVaultSecret,
                );
              },
              getSecret: async (docId, organization) => {
                return SecretGet.getSecret(ctx, docId, organization, {
                  getSecretPublishedEvents: async () => {
                    return cache.getSecretPublishedEvents();
                  },
                });
              },
              secretAlreadyExists: async (docId, organization) => {
                return SecretGet.secretAlreadyExists(ctx, docId, organization, {
                  getSecretPublishedEvents: async () => {
                    return cache.getSecretPublishedEvents();
                  },
                });
              },
              getWorkflowitem: async (projectId, subprojectId, workflowitemId) => {
                return cache.getWorkflowitem(projectId, subprojectId, workflowitemId);
              },
            },
          ),
        groupExists: async (group) => GroupQuery.groupExists(conn, ctx, serviceUser, group),
        getGroup: async (group) => GroupQuery.getGroup(conn, ctx, serviceUser, group),
      },
    ),
  );
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, "permission grant failed");
  }
  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }
}
