import * as express from "express";
import { grantAllPermissions } from "../global/controller/grantAllPermissions";
import { grantGlobalPermission } from "../global/controller/grantPermission";
import { getGlobalPermissions } from "../global/controller/listPermissions";
import { revokeGlobalPermission } from "../global/controller/revokePermission";
import { createGroup } from "../global/createGroup";
import { createProject } from "../global/createProject";
import { createUser } from "../global/createUser";
import { addUserToGroup } from "../group/addUser";
import { getGroupList } from "../group/list";
import { removeUserFromGroup } from "../group/removeUser";
import logger from "../lib/logger";
import { isReady } from "../lib/readiness";
import { MultichainClient } from "../multichain";
import { approveNewNodeForExistingOrganization } from "../network/controller/approveNewNodeForExistingOrganization";
import { approveNewOrganization } from "../network/controller/approveNewOrganization";
import { getNodeList } from "../network/controller/list";
import { getActiveNodes } from "../network/controller/listActive";
import { registerNode } from "../network/controller/registerNode";
import { voteForNetworkPermission } from "../network/controller/vote";
import { getNotificationList } from "../notification/controller/list";
import { markNotificationRead } from "../notification/controller/markRead";
import { assignProject } from "../project/controller/assign";
import { closeProject } from "../project/controller/close";
import { createSubproject } from "../project/controller/createSubproject";
import { grantProjectPermission } from "../project/controller/intent.grantPermission";
import { getProjectPermissions } from "../project/controller/intent.listPermissions";
import { revokeProjectPermission } from "../project/controller/intent.revokePermission";
import { getProjectList } from "../project/controller/list";
import { updateProject } from "../project/controller/update";
import { getProjectDetails } from "../project/controller/viewDetails";
import { getProjectHistory } from "../project/controller/viewHistory";
import { assignSubproject } from "../subproject/controller/assign";
import { closeSubproject } from "../subproject/controller/close";
import { createWorkflowitem } from "../subproject/controller/createWorkflowitem";
import { grantSubprojectPermission } from "../subproject/controller/intent.grantPermission";
import { getSubprojectPermissions } from "../subproject/controller/intent.listPermissions";
import { revokeSubprojectPermission } from "../subproject/controller/intent.revokePermission";
import { getSubprojectList } from "../subproject/controller/list";
import { reorderWorkflowitems } from "../subproject/controller/reorderWorkflowitems";
import { updateSubproject } from "../subproject/controller/update";
import { getSubprojectDetails } from "../subproject/controller/viewDetails";
import { getSubprojectHistory } from "../subproject/controller/viewHistory";
import { authenticateUser } from "../user/controller/authenticate";
import { getUserList } from "../user/controller/list";
import { assignWorkflowitem } from "../workflowitem/controller/assign";
import { closeWorkflowitem } from "../workflowitem/controller/close";
import { grantWorkflowitemPermission } from "../workflowitem/controller/intent.grantPermission";
import { getWorkflowitemPermissions } from "../workflowitem/controller/intent.listPermissions";
import { revokeWorkflowitemPermission } from "../workflowitem/controller/intent.revokePermission";
import { getWorkflowitemList } from "../workflowitem/controller/list";
import { updateWorkflowitem } from "../workflowitem/controller/update";
import { validateDocument } from "../workflowitem/controller/validateDocument";
import { AuthenticatedRequest, HttpResponse } from "./lib";

const send = (res: express.Response, httpResponse: HttpResponse) => {
  const [code, body] = httpResponse;
  res.status(code).json(body);
};

const handleError = (req: AuthenticatedRequest, res: express.Response, err: any) => {
  logger.debug(err);

  switch (err.kind) {
    case "NotAuthorized":
      send(res, [
        403,
        {
          apiVersion: "1.0",
          error: {
            code: 403,
            message: `User ${req.token.userId} is not authorized.`,
          },
        },
      ]);
      break;

    case "UserAlreadyExists":
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message: `The user already exists.` },
        },
      ]);
      break;

    case "GroupAlreadyExists":
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message: `The group already exists.` },
        },
      ]);
      break;

    case "ParseError": {
      let message;
      if (err.message !== undefined) {
        message = `Error parsing fields ${err.badKeys.join(", ")}: ${err.message}`;
      } else {
        message = `Missing keys: ${err.badKeys.join(", ")}`;
      }
      send(res, [400, { apiVersion: "1.0", error: { code: 400, message } }]);
      break;
    }

    case "PreconditionError": {
      const { message } = err;
      send(res, [412, { apiVersion: "1.0", error: { code: 412, message } }]);
      break;
    }

    case "AuthenticationError":
      send(res, [
        401,
        {
          apiVersion: "1.0",
          error: { code: 401, message: "Authentication failed" },
        },
      ]);
      break;

    case "NotFound":
      send(res, [
        404,
        {
          apiVersion: "1.0",
          error: { code: 404, message: "Not found." },
        },
      ]);
      break;

    default:
      // handle RPC errors, too:
      if (err.code === -708) {
        send(res, [
          404,
          {
            apiVersion: "1.0",
            error: { code: 404, message: "Not found." },
          },
        ]);
      } else {
        logger.error(err);
        send(res, [
          500,
          {
            apiVersion: "1.0",
            error: { code: 500, message: "INTERNAL SERVER ERROR" },
          },
        ]);
      }
  }
};

/**
 * @apiDefine user The JWT returned by `user.authenticate` is expected in the request's Authorization header.
 */
/**
 * @api {OBJECT} #Event Event
 * @apiGroup Custom Types
 * @apiParam {String} key The resource ID (same for all events that relate to the same
 * resource).
 * @apiParam {String} intent The intent underlying the event, or in other words: a
 * short string that gives a hint on what happened.
 * @apiParam {String} createdBy The user that has created this event.
 * @apiParam {String} createdAt The (ISO) timestamp marking the event's creation time.
 * @apiParam {Integer} dataVersion The protocol version of the `data` field.
 * @apiParam {Object} data The event payload. The format depends on `intent` and
 * `dataVersion`.
 */

export const createRouter = (
  multichainClient: MultichainClient,
  jwtSecret: string,
  rootSecret: string,
  organization: string,
  organizationVaultSecret: string,
) => {
  const router = express.Router();

  //#region liveness and readiness
  // ------------------------------------------------------------
  //       liveness and readiness
  // ------------------------------------------------------------

  /**
   * @api {get} /readiness Readiness
   * @apiVersion 1.0.0
   * @apiName readiness
   * @apiGroup Liveness and Readiness
   * @apiDescription Returns "200 OK" if the API is up and the Multichain service is
   * reachable; "503 Service unavailable." otherwise.
   */
  router.get("/readiness", async (req, res) => {
    if (await isReady(multichainClient)) {
      res.status(200).send("OK");
    } else {
      res.status(503).send("Service unavailable.");
    }
  });

  /**
   * @api {get} /liveness Liveness
   * @apiVersion 1.0.0
   * @apiName liveness
   * @apiGroup Liveness and Readiness
   * @apiDescription Returns "200 OK" if the API is up.
   */
  router.get("/liveness", (req, res) => res.status(200).send("OK"));

  //#region global
  // ------------------------------------------------------------
  //       global
  // ------------------------------------------------------------

  /**
   * @api {post} /global.createUser Create user
   * @apiVersion 1.0.0
   * @apiName global.createUser
   * @apiGroup Global
   * @apiPermission user
   * @apiDescription Create a new user.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.user Wrapper for user information
   * @apiParam {String} data.user.id The user's id
   * @apiParam {String} data.user.displayName  The user's displayname
   * @apiParam {String} data.user.organization  The user's organization
   * @apiParam {String} data.user.password  The user's password
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "user": {
   *        "id": "alice",
   *        "displayName": "Alice Smith",
   *        "organization": "myorga",
   *        "password": "mysafepassword"
   *        }
   *     }
   *   }
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {String} data.user Wrapper for user information
   * @apiSuccess {String} data.user.id The user's id
   * @apiSuccess {String} data.user.displayName  The user's displayname
   * @apiSuccess {String} data.user.organization  The user's organization
   * @apiSuccess {String} data.user.address  The address of the user's blockchain wallet
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "user": {
   *        "id": "alice",
   *        "displayName": "Alice Smith",
   *        "organization": "myorga",
   *        "address": "1Z8NUT8K6SM6h..."
   *        }
   *     }
   *   }
   */
  router.post("/global.createUser", (req: AuthenticatedRequest, res) => {
    createUser(multichainClient, req, jwtSecret, rootSecret, organizationVaultSecret)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /global.createGroup Create group
   * @apiVersion 1.0.0
   * @apiName global.createGroup
   * @apiGroup Global
   * @apiPermission group
   * @apiDescription Create a new user group.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.group Wrapper for group information
   * @apiParam {String} data.group.id The group's id
   * @apiParam {String} data.group.displayName  The group's displayname
   * @apiParam {String[]} data.group.users  An String[] of userIds which should be added to the new group
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "group": {
   *        "id": "devs",
   *        "displayName": "Developer",
   *        "users": ["alice","john"]
   *        }
   *     }
   *   }
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {String} data.created true if group was successfully created
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "created": true
   *     }
   *   }
   */
  router.post("/global.createGroup", (req: AuthenticatedRequest, res) => {
    createGroup(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /global.createProject Create project
   * @apiVersion 1.0.0
   * @apiName global.createProject
   * @apiGroup Global
   * @apiPermission user
   * @apiDescription Create a new project.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.id The project's id
   * @apiParam {String} data.status Possible values are "open" and "closed" showing the project's status
   * @apiParam {String} data.displayName The project's displayname
   * @apiParam {String} data.description The project's description
   * @apiParam {String} data.amount The amount of money which should be assigned to the project
   * @apiParam {String} data.assignee The project's assignee
   * @apiParam {String} data.currency The currency of the amount assigned to the project
   * @apiParam {String} data.thumbnail The thumbnail representing the project in the trubudget frontend
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "project":{
   *         "id": "myproject",
   *         "status": "open",
   *         "displayName": "Mr. Fox1",
   *         "description": "some description for your project",
   *         "amount": "500",
   *         "assignee": "alice",
   *         "currency": "EUR",
   *         "thumbnail": "thumbnail"
   *       }
   *     }
   *   }
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {String} data.created true if project was successfully created
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "created": true
   *     }
   *   }
   */
  router.post("/global.createProject", (req: AuthenticatedRequest, res) => {
    createProject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /global.listPermissions List permissions
   * @apiVersion 1.0.0
   * @apiName global.listPermissions
   * @apiGroup Global
   * @apiPermission user
   * @apiDescription See the current global permissions.
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {String[]} data.notification.list Lists all userids for the endpoint
   * @apiSuccess {String[]} data.notification.markRead Lists all userids for the endpoint
   * @apiSuccess {String[]} data.global.listPermissions Lists all userids for the endpoint
   * @apiSuccess {String[]} data.global.grantPermission Lists all userids for the endpoint
   * @apiSuccess {String[]} data.global.grantAllPermissions Lists all userids for the endpoint
   * @apiSuccess {String[]} data.global.revokePermission Lists all userids for the endpoint
   * @apiSuccess {String[]} data.global.createProject Lists all userids for the endpoint
   * @apiSuccess {String[]} data.global.createUser Lists all userids for the endpoint
   * @apiSuccess {String[]} data.global.createGroup Lists all userids for the endpoint
   * @apiSuccess {String[]} data.user.intent.listPermissions Lists all userids for the endpoint
   * @apiSuccess {String[]} data.user.intent.grantPermission Lists all userids for the endpoint
   * @apiSuccess {String[]} data.user.intent.revokePermission Lists all userids for the endpoint
   * @apiSuccess {String[]} data.group.addUser Lists all userids for the endpoint
   * @apiSuccess {String[]} data.group.removeUser" Lists all userids for the endpoint
   * @apiSuccess {String[]} data.network.list Lists all userids for the endpoint
   * @apiSuccess {String[]} data.network.voteForPermission Lists all userids for the endpoint
   * @apiSuccess {String[]} data.network.approveNewOrganization Lists all userids for the endpoint
   * @apiSuccess {String[]} data.network.approveNewNodeForExistingOrganization Lists all userids for the endpoint
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "notification.list": [
   *            "alice",
   *            "john"],
   *     "notification.markRead": [],
   *     "network.listActive": [],
   *     "global.listPermissions": [],
   *     "global.grantPermission": [],
   *     "global.grantAllPermissions": [],
   *     "global.revokePermission": [],
   *     "global.createProject": [],
   *     "global.createUser": [],
   *     "global.createGroup": [],
   *     "user.intent.listPermissions": [],
   *     "user.intent.grantPermission": [],
   *     "user.intent.revokePermission": [],
   *     "group.addUser": [],
   *     "group.removeUser": [],
   *     "network.list": [],
   *     "network.voteForPermission": [],
   *     "network.approveNewOrganization": [],
   *     "network.approveNewNodeForExistingOrganization": []
   *     }
   *   }
   */
  router.get("/global.listPermissions", (req: AuthenticatedRequest, res) => {
    getGlobalPermissions(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /global.grantPermission Grant permission
   * @apiVersion 1.0.0
   * @apiName global.grantPermission
   * @apiGroup Global
   * @apiPermission user
   * @apiDescription Grant the right to execute a specific intent on the Global scope to
   * a given user.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.identity The userid or groupid which should get the permission
   * @apiParam {String} data.intent The permission which should be granted.<br/>
   * Possible values:<br/>
   * "global.listPermissions"<br/>
   * "global.grantPermission"<br/>
   * "global.grantAllPermissions"<br/>
   * "global.revokePermission"<br/>
   * "global.createProject"<br/>
   * "global.createUser"<br/>
   * "global.createGroup"<br/>
   * "user.intent.listPermissions"<br/>
   * "user.intent.grantPermission"<br/>
   * "user.intent.revokePermission"<br/>
   * "group.addUser"<br/>
   * "group.removeUser"<br/>
   * "notification.list"<br/>
   * "notification.markRead"<br/>
   * "network.listActive"<br/>
   * "network.list"<br/>
   * "network.voteForPermission"<br/>
   * "network.approveNewOrganization"<br/>
   * "network.approveNewNodeForExistingOrganization"<br/>
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "identity": "alice",
   *       "intent": "global.createProject"
   *     }
   *   }
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/global.grantPermission", (req: AuthenticatedRequest, res) => {
    grantGlobalPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /global.grantAllPermissions Grant all permissions
   * @apiVersion 1.0.0
   * @apiName global.grantAllPermissions
   * @apiGroup Global
   * @apiPermission user
   * @apiDescription Grant all available permissions to a user. Useful as a shorthand
   * for creating admin users.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.identity The userid or groupid which should get all permissions
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "identity": "alice",
   *     }
   *   }
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/global.grantAllPermissions", (req: AuthenticatedRequest, res) => {
    grantAllPermissions(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /global.revokePermission Revoke permission
   * @apiVersion 1.0.0
   * @apiName global.revokePermission
   * @apiGroup Global
   * @apiPermission user
   * @apiDescription Revoke the right to execute a specific intent on the Global scope
   * to a given user.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.identity The userid or groupid which should loose the permission
   * @apiParam {String} data.intent The permission which should be revoked.<br/>
   * Possible values:<br/>
   * "global.listPermissions"<br/>
   * "global.grantPermission"<br/>
   * "global.grantAllPermissions"<br/>
   * "global.revokePermission"<br/>
   * "global.createProject"<br/>
   * "global.createUser"<br/>
   * "global.createGroup"<br/>
   * "user.intent.listPermissions"<br/>
   * "user.intent.grantPermission"<br/>
   * "user.intent.revokePermission"<br/>
   * "group.addUser"<br/>
   * "group.removeUser"<br/>
   * "notification.list"<br/>
   * "notification.markRead"<br/>
   * "network.listActive"<br/>
   * "network.list"<br/>
   * "network.voteForPermission"<br/>
   * "network.approveNewOrganization"<br/>
   * "network.approveNewNodeForExistingOrganization"<br/>
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "identity": "alice",
   *       "intent": "global.createProject"
   *     }
   *   }
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/global.revokePermission", (req: AuthenticatedRequest, res) => {
    revokeGlobalPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  //#endregion global

  //#region group
  // ------------------------------------------------------------
  //       group
  // ------------------------------------------------------------

  /**
   * @api {get} /group.list List
   * @apiVersion 1.0.0
   * @apiName group.list
   * @apiGroup Group
   * @apiPermission group
   * @apiDescription List all user groups.
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Response payload.
   * @apiSuccess {Object[]} data.groups Wrapper for all groups existing
   * @apiSuccess {String} data.groups.groupId GroupId
   * @apiSuccess {String} data.groups.displayName DisplayName of the group
   * @apiSuccess {String[]} data.groups.users Wrapper for all users of the group
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "groups": [
   *           {
   *             "groupId": "devs",
   *             "displayName": "Developer",
   *             "users": [
   *                "alice",
   *                "john"
   *              ]
   *           }
   *        ]
   *      }
   *   }
   */
  router.get("/group.list", (req: AuthenticatedRequest, res) => {
    getGroupList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /group.addUser Add
   * @apiVersion 1.0.0
   * @apiName group.addUser
   * @apiGroup Group
   * @apiPermission group
   * @apiDescription Add user to a group
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.groupId groupid which the user should be added to
   * @apiParam {String} data.userId userid which should be added
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "groupId": "devs",
   *       "userId": "alice"
   *     }
   *   }
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/group.addUser", (req: AuthenticatedRequest, res) => {
    addUserToGroup(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /group.removeUser Remove
   * @apiVersion 1.0.0
   * @apiName group.removeUser
   * @apiGroup Group
   * @apiPermission group
   * @apiDescription Remove user from a group
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.groupId groupid which the user should be removed from
   * @apiParam {String} data.userId userid which should be removed
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "groupId": "devs",
   *       "userId": "alice"
   *     }
   *   }
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/group.removeUser", (req: AuthenticatedRequest, res) => {
    removeUserFromGroup(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  //#region user
  // ------------------------------------------------------------
  //       user
  // ------------------------------------------------------------

  /**
   * @api {get} /user.list List
   * @apiVersion 1.0.0
   * @apiName user.list
   * @apiGroup User
   * @apiPermission user
   * @apiDescription List all registered users.
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {Object[]} data.items Wrapper for all users existing
   * @apiSuccess {String} data.items.id User's id
   * @apiSuccess {String} data.items.displayName User's name
   * @apiSuccess {String} data.items.organization User's organization
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "items": [
   *          {
   *            "id": "alice",
   *            "displayName": "Alice Smith"
   *            "organization": "myorga"
   *          }
   *        ]
   *   }
   */
  router.get("/user.list", (req: AuthenticatedRequest, res) => {
    getUserList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /user.authenticate Authenticate
   * @apiVersion 1.0.0
   * @apiName user.authenticate
   * @apiGroup User
   * @apiDescription Authenticate and retrieve a token in return. This token can then be
   * supplied in the HTTP Authorization header, which is expected by most of the other
   * endpoints.
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {Object} data.user Wrapper for user information
   * @apiSuccess {String} data.user.id User's id
   * @apiSuccess {String} data.user.password User's password
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "user": {
   *            "id": "alice",
   *            "password": "AliceSecretPassword"
   *        }
   *      }
   *   }
   */
  router.post("/user.authenticate", (req: AuthenticatedRequest, res) => {
    authenticateUser(
      multichainClient,
      req,
      jwtSecret,
      rootSecret,
      organization,
      organizationVaultSecret,
    )
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  //#endregion user
  //#region project
  // ------------------------------------------------------------
  //       project
  // ------------------------------------------------------------

  /**
   * @api {get} /project.list List
   * @apiVersion 1.0.0
   * @apiName project.list
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription Retrieve all projects the user is allowed to see.
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {Object[]} data.items Lists all existing projects
   * @apiSuccess {String} data.items.data Wrapper for the project's information
   * @apiSuccess {String} data.items.data.id The project's id
   * @apiSuccess {String} data.items.data.creationUnixTs A unix timestamp when the project was created
   * @apiSuccess {String} data.items.data.status Shows if project is open or closed
   * @apiSuccess {String} data.items.data.displayName The project's displayname
   * @apiSuccess {String} data.items.data.description The project's description
   * @apiSuccess {String} data.items.data.amount The amount of money which should be assigned to the project
   * @apiSuccess {String} data.items.data.assignee The project's assignee
   * @apiSuccess {String} data.items.data.currency The currency of the amount assigned to the project
   * @apiSuccess {String} data.items.data.thumbnail The thumbnail representing the project in the trubudget frontend
   * @apiSuccess {Object[]} data.items.log Holds information about the history of the project
   * @apiSuccess {String[]} data.items.allowedIntents Lists all available endpoints
   *
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "items":[{
   *          "data": {
   *                 "id": "6de80cb1ca780434a58b0752f3470301",
   *                 "creationUnixTs": "1536154645775",
   *                 "status": "open",
   *                 "displayName": "myFirstProject",
   *                 "description": "mydescription",
   *                 "amount": "500",
   *                 "assignee": "alice",
   *                 "currency": "EUR",
   *                 "thumbnail": "/Thumbnail_0001.jpg"
   *             },
   *           "log": [{
   *                 "key": "6de80cb1ca780434a58b0752f3470301",
   *                 "intent": "global.createProject",
   *                     "createdBy": "root",
   *                     "createdAt": "2018-09-05T13:37:25.775Z",
   *                     "dataVersion": 1,
   *                     "data": {
   *                         "project": {
   *                             "id": "6de80cb1ca780434a58b0752f3470301",
   *                             "creationUnixTs": "1536154645775",
   *                             "status": "open",
   *                             "displayName": "myFirstProject",
   *                             "description": "mydescription",
   *                             "amount": "500",
   *                             "assignee": "alice",
   *                             "currency": "EUR",
   *                             "thumbnail": "/Thumbnail_0001.jpg"
   *                         },
   *                         "permissions": {}
   *                     },
   *                     "snapshot": {
   *                         "displayName": "myFirstProject"
   *                     }
   *                 }
   *             ],
   *           "allowedIntents": [
   *                 "global.listPermissions",
   *                 "global.grantPermission",
   *                 "global.grantAllPermissions",
   *                 "global.revokePermission",
   *                 "..."
   *             ]
   *         }
   *   }
   *
   */
  router.get("/project.list", (req: AuthenticatedRequest, res) => {
    getProjectList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /project.viewDetails?projectId={projectId} View details
   * @apiVersion 1.0.0
   * @apiName project.viewDetails
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription Retrieve details about a specific project.
   *
   * @apiParam {String} projectId The project's id from which the details should be shown
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {Object} data.project Wrapper for the specific project
   * @apiSuccess {String} data.project.data Wrapper for the project's information
   * @apiSuccess {String} data.project.data.id The project's id
   * @apiSuccess {String} data.project.data.creationUnixTs A unix timestamp when the project was created
   * @apiSuccess {String} data.project.data.status Shows if project is open or closed
   * @apiSuccess {String} data.project.data.displayName The project's displayname
   * @apiSuccess {String} data.project.data.description The project's description
   * @apiSuccess {String} data.project.data.amount The amount of money which should be assigned to the project
   * @apiSuccess {String} data.project.data.assignee The project's assignee
   * @apiSuccess {String} data.project.data.currency The currency of the amount assigned to the project
   * @apiSuccess {String} data.project.data.thumbnail The thumbnail representing the project in the trubudget frontend
   * @apiSuccess {Object[]} data.project.log Holds information about the history of the project
   * @apiSuccess {String[]} data.project.allowedIntents Lists all available endpoints
   *
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "items":[{
   *          "data": {
   *                 "id": "6de80cb1ca780434a58b0752f3470301",
   *                 "creationUnixTs": "1536154645775",
   *                 "status": "open",
   *                 "displayName": "myFirstProject",
   *                 "description": "mydescription",
   *                 "amount": "500",
   *                 "assignee": "alice",
   *                 "currency": "EUR",
   *                 "thumbnail": "/Thumbnail_0001.jpg"
   *             },
   *           "log": [{
   *                 "key": "6de80cb1ca780434a58b0752f3470301",
   *                 "intent": "global.createProject",
   *                     "createdBy": "alice",
   *                     "createdAt": "2018-09-05T13:37:25.775Z",
   *                     "dataVersion": 1,
   *                     "data": {
   *                         "project": {
   *                             "id": "6de80cb1ca780434a58b0752f3470301",
   *                             "creationUnixTs": "1536154645775",
   *                             "status": "open",
   *                             "displayName": "myFirstProject",
   *                             "description": "mydescription",
   *                             "amount": "500",
   *                             "assignee": "alice",
   *                             "currency": "EUR",
   *                             "thumbnail": "/Thumbnail_0001.jpg"
   *                         },
   *                         "permissions": {}
   *                     },
   *                     "snapshot": {
   *                         "displayName": "myFirstProject"
   *                     }
   *                 }
   *             ],
   *           "allowedIntents": [
   *                 "global.listPermissions",
   *                 "global.grantPermission",
   *                 "global.grantAllPermissions",
   *                 "global.revokePermission",
   *                 "..."
   *             ]
   *         }
   *   }
   *
   */
  router.get("/project.viewDetails", (req: AuthenticatedRequest, res) => {
    getProjectDetails(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /project.assign Assign
   * @apiVersion 1.0.0
   * @apiName project.assign
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription Assign a project to a given user. The assigned user will be
   * notified about the change.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.identity The future assignee (userId or groupId).
   * @apiParam {String} data.projectId The project to be re-assigned.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "identity": "alice",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/project.assign", (req: AuthenticatedRequest, res) => {
    assignProject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /project.update Update
   * @apiVersion 1.0.0
   * @apiName project.update
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription Partially update a project. Only properties mentioned in the
   * request body are touched, others are not affected. The assigned user will be
   * notified about the change.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} [data.displayName]
   * @apiParam {String} [data.description]
   * @apiParam {String} [data.amount]
   * @apiParam {String} [data.currency]
   * @apiParam {String} [data.thumbnail]
   * @apiParam {String} data.projectId The project to be modified.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "displayName": "My Project",
   *       "description": "",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/project.update", (req: AuthenticatedRequest, res) => {
    updateProject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /project.close Close
   * @apiVersion 1.0.0
   * @apiName project.close
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription Set a project's status to "closed" if, and only if, all associated
   * subprojects are already set to "closed".
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.projectId The project to be closed.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/project.close", (req: AuthenticatedRequest, res) => {
    closeProject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /project.createSubproject Create subproject
   * @apiVersion 1.0.0
   * @apiName project.createSubproject
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription Create a subproject and associate it to the given project.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.projectId The project where the subproject should be created.
   * @apiParam {String} data.subproject The Wrapper for the subproject information
   * @apiParam {String} data.subproject.id The subproject's id
   * @apiParam {String} data.subproject.status Possible values are "open" and "closed" showing the subproject's status
   * @apiParam {String} data.subproject.displayName The subproject's displayname
   * @apiParam {String} data.subproject.description The subproject's description
   * @apiParam {String} data.subproject.amount The amount of money which should be assigned to the subproject
   * @apiParam {String} data.subproject.assignee The subproject's assignee
   * @apiParam {String} data.subproject.currency The currency of the amount assigned to the subproject
   * @apiParamExample {json} Request
   * {
   *   "apiVersion": "1.0",
   *   "data": {
   *     "projectId": "6de80cb1ca780434a58b0752f3470301",
   *     "subproject": {
   *       "id": "4re30cb1ca780434a58b0752f3470301",
   *       "status": "open",
   *       "displayName": "mySubProject",
   *       "description": "mydescription",
   *       "amount": "500",
   *       "assignee": "alice",
   *       "currency": "EUR"
   *     }
   *   }
   * }
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {String} data.created true if subproject was successfully created
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "created": true
   *     }
   *   }
   */
  router.post("/project.createSubproject", (req: AuthenticatedRequest, res) => {
    createSubproject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /project.viewHistory?projectId={projectId} View history
   * @apiVersion 1.0.0
   * @apiName project.viewHistory
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription View the history of a given project (filtered by what the user is
   * allowed to see).
   *
   * @apiParam {String} projectId The project's id from which the history should be shown
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {Object[]} data.events Holds information about the history of the project
   * @apiSuccessExample {json} Success-Response
   *   {
   *  "apiVersion": "1.0",
   *  "data": {
   *     "events": [{
   *         "key": "6de80cb1ca780434a58b0752f3470301",
   *         "intent": "global.createProject",
   *             "createdBy": "alice",
   *             "createdAt": "2018-09-05T13:37:25.775Z",
   *             "dataVersion": 1,
   *             "data": {
   *                 "project": {
   *                     "id": "6de80cb1ca780434a58b0752f3470301",
   *                     "creationUnixTs": "1536154645775",
   *                     "status": "open",
   *                     "displayName": "myFirstProject",
   *                     "description": "mydescription",
   *                     "amount": "500",
   *                     "assignee": "alice",
   *                     "currency": "EUR",
   *                     "thumbnail": "/Thumbnail_0001.jpg"
   *                 },
   *                 "permissions": {}
   *             },
   *             "snapshot": {
   *                 "displayName": "myFirstProject"
   *             }
   *         }
   *     ]
   *   }
   * }
   */
  router.get("/project.viewHistory", (req: AuthenticatedRequest, res) => {
    getProjectHistory(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /project.intent.listPermissions List permissions
   * @apiVersion 1.0.0
   * @apiName project.intent.listPermissions
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription See the permissions for a given project.
   *
   * @apiParam {String} projectId The project's id from which the permissions should be listed
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Includes every intent where at least one user has permission for
   * @apiSuccess {String[]} data.project.viewSummary Lists all users with certain permission
   * @apiSuccess {String[]} data.project.viewDetails Lists all users with certain permission
   * @apiSuccessExample {json} Success-Response
   *  {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "project.viewSummary":[
   *          "alice",
   *          "john"
   *        ],
   *       "project.viewDetails":[
   *          "alice"
   *       ],
   *        ...
   *     }
   *   }
   */
  router.get("/project.intent.listPermissions", (req: AuthenticatedRequest, res) => {
    getProjectPermissions(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /project.intent.grantPermission Grant permission
   * @apiVersion 1.0.0
   * @apiName project.intent.grantPermission
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription Grant a permission to a user. After this call has returned, the
   * user will be allowed to execute the given intent.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.userId The user the permission should be granted to.
   * @apiParam {String} data.intent The intent the user should get permissions for.
   * @apiParam {String} data.projectId The project the permissions are effective on.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "userId": "alice",
   *       "intent": "project.assign"
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/project.intent.grantPermission", (req: AuthenticatedRequest, res) => {
    grantProjectPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /project.intent.revokePermission Revoke permission
   * @apiVersion 1.0.0
   * @apiName project.intent.revokePermission
   * @apiGroup Project
   * @apiPermission user
   * @apiDescription Revoke a permission from a user. After this call has returned, the
   * user will no longer be able to execute the given intent.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.userId The user the permission should be revoked from.
   * @apiParam {String} data.intent What the user should no longer be allowed to do.
   * @apiParam {String} data.projectId The project the permissions are effective on.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "userId": "alice",
   *       "intent": "project.close"
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/project.intent.revokePermission", (req: AuthenticatedRequest, res) => {
    revokeProjectPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  //#endregion project
  //#region subproject
  // ------------------------------------------------------------
  //       subproject
  // ------------------------------------------------------------

  /**
   * @api {get} /subproject.list?projectId={projectId} List
   * @apiVersion 1.0.0
   * @apiName subproject.list
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription Retrieve all subprojects for a given project. Note that any
   * subprojects the user is not allowed to see are left out of the response.
   *
   * @apiParam {String} projectId The project's id
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {Object[]} data.items Lists all existing projects
   * @apiSuccess {String} data.items.data Wrapper for the subproject's information
   * @apiSuccess {String} data.items.data.id The subproject's id
   * @apiSuccess {String} data.items.data.creationUnixTs A unix timestamp when the subproject was created
   * @apiSuccess {String} data.items.data.status Shows if subproject is open or closed
   * @apiSuccess {String} data.items.data.displayName The subproject's displayname
   * @apiSuccess {String} data.items.data.description The subproject's description
   * @apiSuccess {String} data.items.data.amount The amount of money which should be assigned to the subproject
   * @apiSuccess {String} data.items.data.assignee The subproject's assignee
   * @apiSuccess {String} data.items.data.currency The currency of the amount assigned to the subproject
   * @apiSuccess {Object[]} data.items.log Holds information about the history of the subproject
   * @apiSuccess {String[]} data.items.allowedIntents Lists all available endpoints
   *
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "items":[{
   *          "data": {
   *                 "id": "6de80cb1ca780434a58b0752f3470301",
   *                 "creationUnixTs": "1536154645775",
   *                 "status": "open",
   *                 "displayName": "myFirstSubproject",
   *                 "description": "mydescription",
   *                 "amount": "500",
   *                 "assignee": "alice",
   *                 "currency": "EUR"
   *             },
   *           "log": [{
   *                 "key": "6de80cb1ca780434a58b0752f3470301",
   *                 "intent": "global.createProject",
   *                     "createdBy": "root",
   *                     "createdAt": "2018-09-05T13:37:25.775Z",
   *                     "dataVersion": 1,
   *                     "data": {
   *                         "subproject": {
   *                             "id": "6de80cb1ca780434a58b0752f3470301",
   *                             "creationUnixTs": "1536154645775",
   *                             "status": "open",
   *                             "displayName": "myFirstProject",
   *                             "description": "mydescription",
   *                             "amount": "500",
   *                             "assignee": "alice",
   *                             "currency": "EUR"
   *                          },
   *                         "permissions": {
   *                            "subproject.intent.listPermissions": [
   *                                 "mstein"
   *                             ],
   *                             "subproject.intent.grantPermission": [
   *                                 "mstein"
   *                             ],
   *                             ...
   *                          }
   *                     },
   *                     "snapshot": {
   *                         "displayName": "myFirstSubproject"
   *                     }
   *                 }
   *             ],
   *           "allowedIntents": [
   *                 "global.listPermissions",
   *                 "global.grantPermission",
   *                 "global.grantAllPermissions",
   *                 "global.revokePermission",
   *                 "..."
   *             ]
   *         }
   *   }
   */
  router.get("/subproject.list", (req: AuthenticatedRequest, res) => {
    getSubprojectList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /subproject.viewDetails View details
   * @apiVersion 1.0.0
   * @apiName subproject.viewDetails
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription Retrieve details about a specific subproject.
   *
   * @apiParam {String} projectId The project's id
   * @apiParam {String} subprojectId The subproject's id from which the details should be shown
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {Object} data.subproject Lists all existing projects
   * @apiSuccess {String} data.subproject.data Wrapper for the subproject's information
   * @apiSuccess {String} data.subproject.data.id The subproject's id
   * @apiSuccess {String} data.subproject.data.creationUnixTs A unix timestamp when the subproject was created
   * @apiSuccess {String} data.subproject.data.status Shows if subproject is open or closed
   * @apiSuccess {String} data.subproject.data.displayName The subproject's displayname
   * @apiSuccess {String} data.subproject.data.description The subproject's description
   * @apiSuccess {String} data.subproject.data.amount The amount of money which should be assigned to the subproject
   * @apiSuccess {String} data.subproject.data.assignee The subproject's assignee
   * @apiSuccess {String} data.subproject.data.currency The currency of the amount assigned to the subproject
   * @apiSuccess {Object[]} data.subproject.log Holds information about the history of the subproject
   * @apiSuccess {String[]} data.subproject.allowedIntents Lists all available endpoints
   *
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "subproject":{
   *          "data": {
   *                 "id": "6de80cb1ca780434a58b0752f3470301",
   *                 "creationUnixTs": "1536154645775",
   *                 "status": "open",
   *                 "displayName": "myFirstSubproject",
   *                 "description": "mydescription",
   *                 "amount": "500",
   *                 "assignee": "alice",
   *                 "currency": "EUR"
   *             },
   *           "log": [{
   *                 "key": "6de80cb1ca780434a58b0752f3470301",
   *                 "intent": "global.createProject",
   *                     "createdBy": "root",
   *                     "createdAt": "2018-09-05T13:37:25.775Z",
   *                     "dataVersion": 1,
   *                     "data": {
   *                         "subproject": {
   *                             "id": "6de80cb1ca780434a58b0752f3470301",
   *                             "creationUnixTs": "1536154645775",
   *                             "status": "open",
   *                             "displayName": "myFirstProject",
   *                             "description": "mydescription",
   *                             "amount": "500",
   *                             "assignee": "alice",
   *                             "currency": "EUR"
   *                          },
   *                         "permissions": {
   *                            "subproject.intent.listPermissions": [
   *                                 "mstein"
   *                             ],
   *                             "subproject.intent.grantPermission": [
   *                                 "mstein"
   *                             ],
   *                             ...
   *                          }
   *                     },
   *                     "snapshot": {
   *                         "displayName": "myFirstSubproject"
   *                     }
   *                 }
   *             ],
   *           "allowedIntents": [
   *                 "global.listPermissions",
   *                 "global.grantPermission",
   *                 "global.grantAllPermissions",
   *                 "global.revokePermission",
   *                 "..."
   *         }
   *   }
   */
  router.get("/subproject.viewDetails", (req: AuthenticatedRequest, res) => {
    getSubprojectDetails(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /subproject.assign Assign
   * @apiVersion 1.0.0
   * @apiName subproject.assign
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription Assign a subproject to a given user. The assigned user will be
   * notified about the change.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.identity The future assignee.
   * @apiParam {String} data.subprojectId The subproject to be re-assigned.
   * @apiParam {String} data.projectId The project the subproject belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "identity": "alice",
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/subproject.assign", (req: AuthenticatedRequest, res) => {
    assignSubproject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /subproject.update Update
   * @apiVersion 1.0.0
   * @apiName subproject.update
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription Partially update a subproject. Only properties mentioned in the
   * request body are touched, others are not affected. The assigned user will be
   * notified about the change.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} [data.displayName]
   * @apiParam {String} [data.description]
   * @apiParam {String} [data.amount]
   * @apiParam {String} [data.currency]
   * @apiParam {String} data.subprojectId The subproject to be modified.
   * @apiParam {String} data.projectId The project the subproject belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "displayName": "My Subproject",
   *       "description": "",
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/subproject.update", (req: AuthenticatedRequest, res) => {
    updateSubproject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /subproject.close Close
   * @apiVersion 1.0.0
   * @apiName subproject.close
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription Set a subproject's status to "closed" if, and only if, all
   * associated workflowitems are already set to "closed".
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.subprojectId The subproject to be closed.
   * @apiParam {String} data.projectId The project the subproject belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/subproject.close", (req: AuthenticatedRequest, res) => {
    closeSubproject(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /subproject.createWorkflowitem Create workflowitem
   * @apiVersion 1.0.0
   * @apiName subproject.createWorkflowitem
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription Create a workflowitem and associate it to the given subproject.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.projectId The project's id.
   * @apiParam {String} data.subprojectId The subproject's id
   * @apiParam {String} data.id The workflowitem's id
   * @apiParam {String} data.status Possible values are "open" and "closed" showing the workflowitem's status
   * @apiParam {String} data.displayName The workflowitem's displayname
   * @apiParam {String} data.description The workflowitem's description
   * @apiParam {String} data.amount The amount of money which should be assigned to the workflowitem
   * @apiParam {String} data.assignee The workflowitem's assignee
   * @apiParam {String} data.currency The currency of the amount assigned to the workflowitem
   * @apiParam {String} data.amountType The amountType could be either "N/A" or "allocated" or "disbursed"
   * @apiParam {Object} data.documents The documents attached to the workflowitem
   * @apiParam {String} data.documents.id The unique name of the document
   * @apiParam {String} data.documents.base64 The document as base64 String
   * @apiParamExample {json} Request
   * {
   *   "apiVersion": "1.0",
   *   "data": {
   *     "projectId": "6de80cb1ca780434a58b0752f3470301",
   *     "subproject": "45thz3efrfca780434a58b0752f3470301"
   *     "status": "open",
   *     "displayName": "myWorkflowitem",
   *     "description": "mydescription",
   *     "amount": "500",
   *     "assignee": "alice",
   *     "currency": "EUR",
   *     "amountType": "disbursed"
   *     "documents": [
   *        {
   *        "id": "Doc1",
   *        "base64": "c29tZXRoaW5ns"
   *        },
   *        ...
   *      ]
   *   }
   * }
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {String} data.created true if workflowitem was successfully created
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "created": true
   *     }
   *   }
   */
  router.post("/subproject.createWorkflowitem", (req: AuthenticatedRequest, res) => {
    createWorkflowitem(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /subproject.reorderWorkflowitems Reorder Workflowitems
   * @apiVersion 1.0.0
   * @apiName subproject.reorderWorkflowitems
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription Set a new workflowitem ordering. Workflowitems not included in the
   * list will be ordered by their creation time and placed after all explicitly ordered
   * workflowitems.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.subprojectId The subproject to be closed.
   * @apiParam {String} data.projectId The project the subproject belongs to.
   * @apiParam {String[]} data.ordering Contains all workflowitem which should be ordered
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301",
   *       "ordering": [
   *          "56z9ki1ca780434a58b0752f3470301",
   *          "454zjukca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/subproject.reorderWorkflowitems", (req: AuthenticatedRequest, res) => {
    reorderWorkflowitems(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /subproject.viewHistory?projectId={projectId}&subprojectId={subprojectId} View history
   * @apiVersion 1.0.0
   * @apiName subproject.viewHistory
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription View the history of a given subproject (filtered by what the user
   * is allowed to see).
   *
   * @apiParam {String} projectId The project's id
   * @apiParam {String} subprojectId The subproject's id from which the history should be shown
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Request payload.
   * @apiSuccess {Object[]} data.events Holds information about the history of the subproject
   * @apiSuccessExample {json} Success-Response
   *  {
   *  "apiVersion": "1.0",
   *  "data": {
   *     "events": [{
   *         "key": "6de80cb1ca780434a58b0752f3470301",
   *         "intent": "global.createProject",
   *         "createdBy": "alice",
   *         "createdAt": "2018-09-05T13:37:25.775Z",
   *         "dataVersion": 1,
   *         "data": [
   *             "89or46ztg9180434a58b0752f3470301",
   *             "ef567t78780434a58b075872f3470301"
   *             ],
   *         "permissions": {}
   *         "snapshot": {
   *           "displayName": "myFirstWorkflowitem"
   *          }
   *      },
   *      ...
   * ]
   *   }
   * }
   */

  router.get("/subproject.viewHistory", (req: AuthenticatedRequest, res) => {
    getSubprojectHistory(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /subproject.intent.listPermissions?projectId={projectId}&subprojectId={subprojectId} List permissions
   * @apiVersion 1.0.0
   * @apiName subproject.intent.listPermissions
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription See the permissions for a given subproject.
   *
   * @apiParam {String} projectId The project's id
   * @apiParam {String} subprojectId The subproject's id
   *
   * @apiSuccess {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiSuccess {Object} data Includes every intent where at least one user has permission for
   * @apiSuccess {String[]} data.subproject.assign Lists all users with certain permission
   * @apiSuccess {String[]} data.subproject.update Lists all users with certain permission
   * @apiSuccessExample {json} Success-Response
   *  {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "subproject.assign":[
   *          "alice",
   *          "john"
   *        ],
   *       "subproject.update":[
   *          "alice"
   *       ],
   *        ...
   *     }
   *   }
   */
  router.get("/subproject.intent.listPermissions", (req: AuthenticatedRequest, res) => {
    getSubprojectPermissions(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /subproject.intent.grantPermission Grant permission
   * @apiVersion 1.0.0
   * @apiName subproject.intent.grantPermission
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription Grant a permission to a user. After this call has returned, the
   * user will be allowed to execute the given intent.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.identity The user the permission should be granted to.
   * @apiParam {String} data.intent The intent the user should get permissions for.
   * @apiParam {String} data.subprojectId The subproject the permissions are effective on.
   * @apiParam {String} data.projectId The project the subproject belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "identity": "alice",
   *       "intent": "subproject.close"
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/subproject.intent.grantPermission", (req: AuthenticatedRequest, res) => {
    grantSubprojectPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /subproject.intent.revokePermission Revoke permission
   * @apiVersion 1.0.0
   * @apiName subproject.intent.revokePermission
   * @apiGroup Subproject
   * @apiPermission user
   * @apiDescription Revoke a permission from a user. After this call has returned, the
   * user will no longer be able to execute the given intent.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.identity The user the permission should be revoked from.
   * @apiParam {String} data.intent What the user should no longer be allowed to do.
   * @apiParam {String} data.subprojectId The subproject the permissions are effective on.
   * @apiParam {String} data.projectId The project the subproject belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "identity": "alice",
   *       "intent": "subproject.close"
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/subproject.intent.revokePermission", (req: AuthenticatedRequest, res) => {
    revokeSubprojectPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  //#endregion subproject
  //#region workflowitem
  // ------------------------------------------------------------
  //      workflowitem
  // ------------------------------------------------------------

  /**
   * @api {get} /workflowitem.list List
   * @apiVersion 1.0.0
   * @apiName workflowitem.list
   * @apiGroup Workflowitem
   * @apiPermission user
   * @apiDescription Retrieve all workflowitems of a given subproject. Those items the
   * user is not allowed to see will be redacted, that is, most of their values will be
   * set to null.
   */
  router.get("/workflowitem.list", (req: AuthenticatedRequest, res) => {
    getWorkflowitemList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /workflowitem.assign Assign
   * @apiVersion 1.0.0
   * @apiName workflowitem.assign
   * @apiGroup Workflowitem
   * @apiPermission user
   * @apiDescription Assign a workflowitem to a given user. The assigned user will be
   * notified about the change.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.userId The future assignee.
   * @apiParam {String} data.workflowitemId The workflowitem to be re-assigned.
   * @apiParam {String} data.subprojectId The subproject the workflowitem belongs to.
   * @apiParam {String} data.projectId The project the workflowitem belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "userId": "alice",
   *       "workflowitemId": "e5011a1009f28dcca6ab0e3b9b229d57",
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/workflowitem.assign", (req: AuthenticatedRequest, res) => {
    assignWorkflowitem(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /workflowitem.update Update
   * @apiVersion 1.0.0
   * @apiName workflowitem.update
   * @apiGroup Workflowitem
   * @apiPermission user
   * @apiDescription Partially update a workflowitem. Only properties mentioned in the
   * request body are touched, others are not affected. The assigned user will be
   * notified about the change.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} [data.displayName]
   * @apiParam {String} [data.amount]
   * @apiParam {String} [data.currency]
   * @apiParam {String} [data.amountType]
   * @apiParam {String} [data.description]
   * @apiParam {String} data.workflowitemId The workflowitem to be modified.
   * @apiParam {String} data.subprojectId The subproject the workflowitem belongs to.
   * @apiParam {String} data.projectId The project the workflowitem belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "displayName": "My Workflowitem",
   *       "description": "",
   *       "workflowitemId": "e5011a1009f28dcca6ab0e3b9b229d57",
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/workflowitem.update", (req: AuthenticatedRequest, res) => {
    updateWorkflowitem(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /workflowitem.close Close
   * @apiVersion 1.0.0
   * @apiName workflowitem.close
   * @apiGroup Workflowitem
   * @apiPermission user
   * @apiDescription Set a workflowitem's status to "closed".
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.workflowitemId The workflowitem to be closed.
   * @apiParam {String} data.subprojectId The subproject the workflowitem belongs to.
   * @apiParam {String} data.projectId The project the workflowitem belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "workflowitemId": "e5011a1009f28dcca6ab0e3b9b229d57",
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/workflowitem.close", (req: AuthenticatedRequest, res) => {
    closeWorkflowitem(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /workflowitem.intent.listPermissions List permissions
   * @apiVersion 1.0.0
   * @apiName workflowitem.intent.listPermissions
   * @apiGroup Workflowitem
   * @apiPermission user
   * @apiDescription See the permissions for a given workflowitem.
   */
  router.get("/workflowitem.intent.listPermissions", (req: AuthenticatedRequest, res) => {
    getWorkflowitemPermissions(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /workflowitem.intent.grantPermission Grant permission
   * @apiVersion 1.0.0
   * @apiName workflowitem.intent.grantPermission
   * @apiGroup Workflowitem
   * @apiPermission user
   * @apiDescription Grant a permission to a user. After this call has returned, the
   * user will be allowed to execute the given intent.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.userId The user the permission should be granted to.
   * @apiParam {String} data.intent The intent the user should get permissions for.
   * @apiParam {String} data.workflowitemId The workflowitem the permissions are effective on.
   * @apiParam {String} data.subprojectId The subproject the workflowitem belongs to.
   * @apiParam {String} data.projectId The project the workflowitem belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "userId": "alice",
   *       "intent": "workflowitem.close"
   *       "workflowitemId": "e5011a1009f28dcca6ab0e3b9b229d57",
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/workflowitem.intent.grantPermission", (req: AuthenticatedRequest, res) => {
    grantWorkflowitemPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /workflowitem.intent.revokePermission Revoke permission
   * @apiVersion 1.0.0
   * @apiName workflowitem.intent.revokePermission
   * @apiGroup Workflowitem
   * @apiPermission user
   * @apiDescription Revoke a permission from a user. After this call has returned, the
   * user will no longer be able to execute the given intent.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.userId The user the permission should be revoked from.
   * @apiParam {String} data.intent What the user should no longer be allowed to do.
   * @apiParam {String} data.workflowitemId The workflowitem the permissions are effective on.
   * @apiParam {String} data.subprojectId The subproject the workflowitem belongs to.
   * @apiParam {String} data.projectId The project the workflowitem belongs to.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "userId": "alice",
   *       "intent": "workflowitem.close"
   *       "workflowitemId": "e5011a1009f28dcca6ab0e3b9b229d57",
   *       "subprojectId": "0f3967d2eeddd14fb2a7c250e59d630a",
   *       "projectId": "6de80cb1ca780434a58b0752f3470301"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/workflowitem.intent.revokePermission", (req: AuthenticatedRequest, res) => {
    revokeWorkflowitemPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {post} /workflowitem.validateDocument Validate Document
   * @apiVersion 1.0.0
   * @apiName workflowitem.validateDocument
   * @apiGroup Workflowitem
   * @apiPermission user
   * @apiDescription Validates if the hashed base64 string equals the hash sent by the user.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.base64String base64-string which will be hashed and compared to the other hash value.
   * @apiParam {String} data.hash hash value which shall be compared with the hashed base64-string.
   * @apiParamExample {json} Request
   *   {
   *   "apiVersion": "1.0",
   *   "data": {
   *     "base64String": "c29tZWh0aW5n",
   *     "hash": "3FC9B689459D738F8C88A3A48AA9E33542016B7A4052E001AAA536FCA74813CB"
   *   }
   *  }
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiSuccess {boolean} data.isIdentical true if the hash equals the hashed base64-string
   * @apiSuccessExample {json} Success-Response
   *  {
   *  "apiVersion": "1.0",
   *     "data": {
   *       "isIdentical": false
   *     }
   *   }
   */
  router.post("/workflowitem.validateDocument", (req: AuthenticatedRequest, res) => {
    validateDocument(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  //#endregion workflowitem
  //#region notification
  // ------------------------------------------------------------
  //      notification
  // ------------------------------------------------------------

  /**
   * @api {get} /notification.list List for user
   * @apiVersion 1.0.0
   * @apiName notification.list
   * @apiGroup Notification
   * @apiPermission user
   * @apiDescription List notifications for the user, given by the token in the
   * request's `Authorization` header. By default, the response includes _all_
   * notifications, but the `sinceId` parameter may be used to truncate the output.
   *
   * @apiParam {String} [sinceId] If specified, only newer notifications are returned. If
   * the given ID is invalid or cannot be found, the parameter is ignored and all
   * notifications are returned.
   *
   * @apiSuccess {String} apiVersion
   * Version of the response layout (e.g., "1.0").
   * @apiSuccess {Object} data
   * Response payload.
   * @apiSuccess {Object[]} data.notifications
   * The list of notifications.
   * @apiSuccess {String} data.notifications.notificationId
   * Each notification has a unique ID, which can also be used with this call's `query` parameter.
   * @apiSuccess {Boolean}  data.notifications.isRead
   * Set to `true` if notification is marked as read, and to `false` otherwise.
   * @apiSuccess {[Event](#api-Custom_Types-ObjectEvent)} data.notifications.originalEvent
   * The event that triggered the notification.
   * @apiSuccess {Object[]} data.notifications.resources
   * A list of related resources, started with the one the event is directly related to.
   * @apiSuccess {String} data.notifications.resources.id
   * The ID of the related resource.
   * @apiSuccess {String=project,subproject,workflowitem} data.notifications.resources.type
   * The type of the related resource.
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "notifications": [
   *         {
   *           "notificationId": "b6455e52-36fd-4951-bdc8-e90956036b14",
   *           "resources": [
   *               {
   *                   "id": "9a06006d5df285e0f861a82c560aaf37",
   *                   "type": "workflowitem"
   *               },
   *               {
   *                   "id": "d8217571d95ca63a229605d50f729674",
   *                   "type": "subproject"
   *               },
   *               {
   *                   "id": "9c4ac328d8da59871c8a4da34ddfaf17",
   *                   "type": "project"
   *               }
   *           ],
   *           "isRead": false,
   *           "originalEvent": {
   *               "key": "9a06006d5df285e0f861a82c560aaf37",
   *               "intent": "workflowitem.close",
   *               "createdBy": "alice",
   *               "createdAt": "2018-05-28T13:08:45.487Z",
   *               "dataVersion": 1,
   *               "data": {}
   *           }
   *         }
   *       ]
   *     }
   *   }
   */
  router.get("/notification.list", (req: AuthenticatedRequest, res) => {
    getNotificationList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /notification.markRead Mark read
   * @apiVersion 1.0.0
   * @apiName notification.markRead
   * @apiGroup Notification
   * @apiPermission user
   * @apiDescription Allows a user to mark any of his/her notifications as read, which
   * is then reflected by the `isRead` flag carried in the `notification.list` response.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.notificationId The notification to be marked as read.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "notificationId": "b6455e52-36fd-4951-bdc8-e90956036b14"
   *     }
   *   }
   *
   * @apiSuccess {String} apiVersion Version of the response layout (e.g., "1.0").
   * @apiSuccess {String=OK} data
   * @apiSuccessExample {json} Success-Response
   *   {
   *     "apiVersion": "1.0",
   *     "data": "OK"
   *   }
   */
  router.post("/notification.markRead", (req: AuthenticatedRequest, res) => {
    markNotificationRead(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  //#endregion notification
  //#region network
  // ------------------------------------------------------------
  //       network
  // ------------------------------------------------------------

  /* Used by non-master MultiChain nodes to register their wallet address.
   *
   * (undocumented)
   */
  router.post("/network.registerNode", (req: AuthenticatedRequest, res) => {
    registerNode(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /network.voteForPermission Grant/revoke permissions
   * @apiVersion 1.0.0
   * @apiName network.voteForPermission
   * @apiGroup Network
   * @apiPermission user
   * @apiDescription Votes for granting/revoking network-level permissions to/from a
   * registered node (identified by its wallet addresses). After this call, the voted
   * access level may or may not be in effect, depending on the consensus parameters of
   * the underlying blockchain.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.address The node (wallet address) to vote for.
   * @apiParam {String="none","basic","admin"} data.vote The access type voted for. "none"
   * means no access at all. "basic" means that the node should be able to join the
   * network, but not run privileged operations, like creating a new organization.
   * Choose this access type for any additional nodes of an existing organization.
   * Finally, a node with "admin" permissions can do (almost) everything, which is why
   * this access type should only be applied to fully trusted nodes.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "address": "13ePdKiZeSd787D6styeaSugyJjpM3SdLBibJy",
   *       "vote": "admin"
   *     }
   *   }
   *
   */
  router.post("/network.voteForPermission", (req: AuthenticatedRequest, res) => {
    voteForNetworkPermission(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post("/network.approveNewOrganization", (req: AuthenticatedRequest, res) => {
    approveNewOrganization(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  router.post(
    "/network.approveNewNodeForExistingOrganization",
    (req: AuthenticatedRequest, res) => {
      approveNewNodeForExistingOrganization(multichainClient, req)
        .then(response => send(res, response))
        .catch(err => handleError(req, res, err));
    },
  );

  /* List all TruBudget nodes.
   *
   * (undocumented)
   */
  router.get("/network.list", (req: AuthenticatedRequest, res) => {
    getNodeList(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  /**
   * @api {get} /network.listActive active Peers
   * @apiVersion 1.0.0
   * @apiName network.listActive
   * @apiGroup Network
   * @apiPermission user
   * @apiDescription Get the number of all peers in the blockchain network.
   *
   * @apiParam {String} apiVersion Version of the request layout (e.g., "1.0").
   * @apiParam {Object} data Request payload.
   * @apiParam {String} data.peers The node (wallet address) to vote for.
   * @apiParamExample {json} Request
   *   {
   *     "apiVersion": "1.0",
   *     "data": {
   *       "peers": "15",
   *     }
   *   }
   *
   */
  router.get("/network.listActive", (req: AuthenticatedRequest, res) => {
    getActiveNodes(multichainClient, req)
      .then(response => send(res, response))
      .catch(err => handleError(req, res, err));
  });

  return router;
};
