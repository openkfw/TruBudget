import { RequestGenericInterface, RouteShorthandOptions } from "fastify";
import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Notification from "./service/domain/workflow/notification";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import * as Workflowitem from "./service/domain/workflow/workflowitem";
import { extractUser } from "./handlerUtils";
import { silentRouteSettings } from "./lib/loggingTools";

/**
 * Creates the swagger schema for the `/notification.list` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): RouteShorthandOptions {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "List (a part of) an authenticated user's notifications.",
      tags: ["notification"],
      summary: "List (a part of) an authenticated user's notifications.",
      security: [{ bearerToken: [] }],
      querystring: {
        type: "object",
        properties: {
          limit: {
            type: "string",
            description: "Limit to the number of notifications to return.",
          },
          offset: {
            type: "string",
            description:
              "The index of the first notification; all other notifications are for " +
              "events that happened after that first notification. The `offset` may also " +
              "be negative. For example, an `offset` of `-10` with limit `10` requests " +
              "the 10 most recent notifications.",
          },
        },
      },
      response: {
        200: {
          description: "Notifications for the authenticated user.",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                userId: { type: "string", example: "jdoe" },
                notifications: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "2cfd0663-1770-4184-974e-63129061d389" },
                      isRead: { type: "boolean", example: false },
                      businessEvent: {
                        type: "object",
                        properties: {
                          type: { type: "string", example: "project_assigned" },
                          time: { type: "string", example: "2019-03-13T10:18:31.800Z" },
                          publisher: { type: "string", example: "jdoe" },
                        },
                      },
                      metadata: {
                        type: "object",
                        properties: {
                          project: {
                            type: "object",
                            properties: {
                              displayName: { type: "string", example: "Building a School" },
                              hasViewPermissions: { type: "boolean", example: true },
                              id: { type: "string", example: "er3t469eg298c87e3899119e025eff1f" },
                            },
                          },
                          subproject: {
                            type: "object",
                            properties: {
                              displayName: { type: "string", example: "Organize Furniture" },
                              hasViewPermissions: { type: "boolean", example: true },
                              id: { type: "string", example: "er3t469eg298c87e3899119e025eff1f" },
                            },
                          },
                          workflowitem: {
                            type: "object",
                            properties: {
                              displayName: { type: "string", example: "Deliver Furniture" },
                              hasViewPermissions: { type: "boolean", example: true },
                              id: { type: "string", example: "er3t469eg298c87e3899119e025eff1f" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Represents a project without view permissions
 * @notExported
 */
interface ProjectWithoutViewPermissions {
  id: string;
  hasViewPermissions: false;
}

/**
 * Represents a project with view permissions
 * @notExported
 */
interface ProjectWithViewPermissions {
  id: string;
  hasViewPermissions: true;
  displayName: string;
}

/**
 * Represents a notification with a project as metadata
 * @notExported
 */
interface ProjectNotificationMetadata {
  project: ProjectWithViewPermissions | ProjectWithoutViewPermissions;
}

/**
 * Represents a subproject without view permissions
 * @notExported
 */
interface SubprojectWithoutViewPermissions {
  id: string;
  hasViewPermissions: false;
}

/**
 * Represents a subproject with view permissions
 * @notExported
 */
interface SubprojectWithViewPermissions {
  id: string;
  hasViewPermissions: true;
  displayName: string;
}

/**
 * Represents a notification with a project and a subproject as metadata
 * @notExported
 */
interface SubprojectNotificationMetadata {
  project: ProjectWithViewPermissions | ProjectWithoutViewPermissions;
  subproject: SubprojectWithViewPermissions | SubprojectWithoutViewPermissions;
}

/**
 * Represents a workflowitem without view permissions
 * @notExported
 */
interface WorkflowitemWithoutViewPermissions {
  id: string;
  hasViewPermissions: false;
}

/**
 * Represents a workflowitem with view permissions
 * @notExported
 */
interface WorkflowitemWithViewPermissions {
  id: string;
  hasViewPermissions: true;
  displayName: string;
}

/**
 * Represents a workflowitem with a project, a subproject and a workflowitem as metadata
 * @notExported
 */
interface WorkflowitemNotificationMetadata {
  project: ProjectWithViewPermissions | ProjectWithoutViewPermissions;
  subproject: SubprojectWithViewPermissions | SubprojectWithoutViewPermissions;
  workflowitem: WorkflowitemWithViewPermissions | WorkflowitemWithoutViewPermissions;
}

/**
 * Type representing the notification metadata
 * @notExported
 */
type NotificationMetadata =
  | ProjectNotificationMetadata
  | SubprojectNotificationMetadata
  | WorkflowitemNotificationMetadata;

/**
 * Represents an exposed notification
 * @notExported
 */
interface ExposedNotification {
  id: string;
  isRead: boolean;
  businessEvent: {
    type: string;
    time: string; // ISO timestamp
    publisher: string;
  };
  metadata?: NotificationMetadata;
}

/**
 * Represents the service that handles listing notifications
 */
interface Service {
  getNotificationsForUser(
    ctx: Ctx,
    user: ServiceUser,
  ): Promise<Result.Type<Notification.Notification[]>>;
  getProject(ctx: Ctx, user: ServiceUser, projectId: string): Promise<Result.Type<Project.Project>>;
  getSubproject(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
  getWorkflowitem(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem>>;
}

// eslint-disable-next-line @typescript-eslint/prefer-as-const
const TRUE = true as true;
// eslint-disable-next-line @typescript-eslint/prefer-as-const
const FALSE = false as false;

/**
 * Get the metadata of a project to show in the notification
 *
 * @param ctx the current context {@link Ctx}
 * @param user the {@link ServiceUser} performing the request
 * @param service the {@link Service} object used to offer an interface to the domain logic
 * @param projectId the id of the project to be returned
 * @returns a promise containing the metadata visible to a user either with or without permissions
 * @notExported
 */
async function getProjectMetadata(
  ctx: Ctx,
  user: ServiceUser,
  service: Service,
  projectId: string,
): Promise<ProjectWithViewPermissions | ProjectWithoutViewPermissions> {
  const project = await service.getProject(ctx, user, projectId);
  return Result.unwrapOr(
    Result.map(project, (x) => ({
      id: x.id,
      hasViewPermissions: TRUE,
      displayName: x.displayName,
    })),
    { id: projectId, hasViewPermissions: FALSE },
  );
}

/**
 * Get the metadata of a subproject to show in the notification
 *
 * @param ctx the current context {@link Ctx}
 * @param user the {@link ServiceUser} performing the request
 * @param service the {@link Service} object used to offer an interface to the domain logic
 * @param projectId the id of the project which contains the subproject
 * @param subprojectId the id of the subproject to be returned
 * @returns a promise containing the metadata visible to a user either with or without permissions
 * @notExported
 */
async function getSubprojectMetadata(
  ctx: Ctx,
  user: ServiceUser,
  service: Service,
  projectId: string,
  subprojectId: string,
): Promise<SubprojectWithViewPermissions | SubprojectWithoutViewPermissions> {
  const subproject = await service.getSubproject(ctx, user, projectId, subprojectId);
  return Result.unwrapOr(
    Result.map(subproject, (x) => ({
      id: x.id,
      hasViewPermissions: TRUE,
      displayName: x.displayName,
    })),
    { id: subprojectId, hasViewPermissions: FALSE },
  );
}

/**
 * Get the metadata of a workflowitem to show in the notification
 *
 * @param ctx the current context {@link Ctx}
 * @param user the {@link ServiceUser} performing the request
 * @param service the {@link Service} object used to offer an interface to the domain logic
 * @param projectId the id of the project which contains the workflowitem
 * @param subprojectId the id of the subproject which contains the workflowitem
 * @param workflowitemId the id of the workflowitem to be returned
 * @returns a promise containing the metadata visible to a user either with or without permissions
 * @notExported
 */
async function getWorkflowitemMetadata(
  ctx: Ctx,
  user: ServiceUser,
  service: Service,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<WorkflowitemWithViewPermissions | WorkflowitemWithoutViewPermissions> {
  const workflowitem = await service.getWorkflowitem(
    ctx,
    user,
    projectId,
    subprojectId,
    workflowitemId,
  );
  return Result.unwrapOr(
    Result.map(workflowitem, (x) => ({
      id: x.id,
      hasViewPermissions: TRUE,
      displayName: x.displayName,
    })),
    { id: workflowitemId, hasViewPermissions: FALSE },
  );
}

/**
 * Retrieves the metadata for a specific notification
 *
 * @param ctx the current context {@link Ctx}
 * @param user the {@link ServiceUser} performing the request
 * @param notification the {@link Notification.Notification} for which the metadata should be retrieved
 * @param service the {@link Service} object used to offer an interface to the domain logic
 * @returns the notification metadata as a {@link NotificationMetadata} or undefined if no project and subproject id is provided in the {@link Notification.Notification}
 * @notExported
 */
async function getMetadata(
  ctx: Ctx,
  user: ServiceUser,
  notification: Notification.Notification,
  service: Service,
): Promise<NotificationMetadata | undefined> {
  const { projectId, subprojectId, workflowitemId } = notification;

  if (projectId !== undefined && subprojectId !== undefined && workflowitemId !== undefined) {
    return {
      project: await getProjectMetadata(ctx, user, service, projectId),
      subproject: await getSubprojectMetadata(ctx, user, service, projectId, subprojectId),
      workflowitem: await getWorkflowitemMetadata(
        ctx,
        user,
        service,
        projectId,
        subprojectId,
        workflowitemId,
      ),
    };
  } else if (projectId !== undefined && subprojectId !== undefined) {
    return {
      project: await getProjectMetadata(ctx, user, service, projectId),
      subproject: await getSubprojectMetadata(ctx, user, service, projectId, subprojectId),
    };
  } else if (projectId !== undefined) {
    return {
      project: await getProjectMetadata(ctx, user, service, projectId),
    };
  } else {
    return undefined;
  }
}

interface Request extends RequestGenericInterface {
  Querystring: {
    offset?: string;
    limit?: string;
  };
}

/**
 * Creates an http handler that handles incoming http requests for the `/notification.list` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
): void {
  server.register(async function () {
    server.get<Request>(
      `${urlPrefix}/notification.list`,
      silentRouteSettings(mkSwaggerSchema(server)),
      async (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        // Default: last created history event
        let offset = 0;
        if (request.query.offset !== undefined) {
          offset = parseInt(request.query.offset, 10);
          if (isNaN(offset)) {
            const message = "if present, the query parameter `offset` must be an integer";

            reply.status(400).send({
              apiVersion: "1.0",
              error: {
                code: 400,
                message,
              },
            });
            request.log.error({ err: message }, "Invalid request body");

            return;
          }
        }

        // Default: no limit
        let limit: number | undefined;
        if (request.query.limit !== undefined) {
          limit = parseInt(request.query.limit, 10);
          if (isNaN(limit) || limit <= 0) {
            const message = "if present, the query parameter `limit` must be a positive integer";
            reply.status(400).send({
              apiVersion: "1.0",
              error: {
                code: 400,
                message,
              },
            });
            request.log.error({ err: message }, "Invalid request body");

            return;
          }
        }

        try {
          const notificationsResult = await service.getNotificationsForUser(ctx, user);
          if (Result.isErr(notificationsResult)) {
            throw new VError(notificationsResult, "notification.list failed");
          }
          const notifications = notificationsResult;
          notifications.sort(byEventTime);

          const offsetIndex = offset < 0 ? Math.max(0, notifications.length + offset) : offset;
          const slice = notifications.slice(
            offsetIndex,
            limit === undefined ? undefined : offsetIndex + limit,
          );

          request.log.debug("Getting exposed Notifcations");
          const exposedNotifications: ExposedNotification[] = [];
          for (const notification of slice) {
            const metadata = await getMetadata(ctx, user, notification, service);
            exposedNotifications.push({
              id: notification.id,
              isRead: notification.isRead,
              businessEvent: {
                type: notification.businessEvent.type,
                time: notification.businessEvent.time,
                publisher: notification.businessEvent.publisher,
              },
              metadata,
            });
          }

          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              userId: user.id,
              notifications: exposedNotifications,
            },
          };
          reply.status(code).send(body);
        } catch (err) {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while getting Notifications");
          reply.status(code).send(body);
        }
      },
    );
  });
}

/**
 * Sorts notification by event time
 *
 * @param a first notification to check
 * @param b second notification to check
 * @returns value mentioning if @param a happens before after or at the same time as @param b
 */
function byEventTime(a: Notification.Notification, b: Notification.Notification): -1 | 0 | 1 {
  const timeA = new Date(a.businessEvent.time);
  const timeB = new Date(b.businessEvent.time);
  if (timeA < timeB) return -1;
  if (timeA > timeB) return 1;
  return 0;
}
