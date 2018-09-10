import * as fastify from 'fastify'
import logger from "../lib/logger";
import { isReady } from "../lib/readiness";
import { MultichainClient } from "../multichain";
import { AuthenticatedRequest, HttpResponse } from "./lib";
import { FastifyInstance } from "fastify";
import {Schema} from './schema';

// const send = (res: express.Response, httpResponse: HttpResponse) => {
//   const [code, body] = httpResponse;
//   res.status(code).json(body);
// };

// const handleError = (req: AuthenticatedRequest, res: express.Response, err: any) => {
//   logger.debug(err);

//   switch (err.kind) {
//     case "NotAuthorized":
//       send(res, [
//         403,
//         {
//           apiVersion: "1.0",
//           error: {
//             code: 403,
//             message: `User ${req.token.userId} is not authorized.`,
//           },
//         },
//       ]);
//       break;

//     case "UserAlreadyExists":
//       send(res, [
//         409,
//         {
//           apiVersion: "1.0",
//           error: { code: 409, message: `The user already exists.` },
//         },
//       ]);
//       break;

//     case "GroupAlreadyExists":
//       send(res, [
//         409,
//         {
//           apiVersion: "1.0",
//           error: { code: 409, message: `The group already exists.` },
//         },
//       ]);
//       break;

//     case "ParseError": {
//       let message;
//       if (err.message !== undefined) {
//         message = `Error parsing fields ${err.badKeys.join(", ")}: ${err.message}`;
//       } else {
//         message = `Missing keys: ${err.badKeys.join(", ")}`;
//       }
//       send(res, [400, { apiVersion: "1.0", error: { code: 400, message } }]);
//       break;
//     }

//     case "PreconditionError": {
//       const { message } = err;
//       send(res, [412, { apiVersion: "1.0", error: { code: 412, message } }]);
//       break;
//     }

//     case "AuthenticationError":
//       send(res, [
//         401,
//         {
//           apiVersion: "1.0",
//           error: { code: 401, message: "Authentication failed" },
//         },
//       ]);
//       break;

//     case "NotFound":
//       send(res, [
//         404,
//         {
//           apiVersion: "1.0",
//           error: { code: 404, message: "Not found." },
//         },
//       ]);
//       break;

//     default:
//       // handle RPC errors, too:
//       if (err.code === -708) {
//         send(res, [
//           404,
//           {
//             apiVersion: "1.0",
//             error: { code: 404, message: "Not found." },
//           },
//         ]);
//       } else {
//         logger.error(err);
//         send(res, [
//           500,
//           {
//             apiVersion: "1.0",
//             error: { code: 500, message: "INTERNAL SERVER ERROR" },
//           },
//         ]);
//       }
//   }
// };

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

export const registerRoutes = (
  server: FastifyInstance,
  multichainClient: MultichainClient,
  jwtSecret: string,
  rootSecret: string,
  organization: string,
  organizationVaultSecret: string,
) => {

  /**
   * @api {get} /readiness Readiness
   * @apiVersion 1.0.0
   * @apiName readiness
   * @apiGroup Liveness and Readiness
   * @apiDescription Returns "200 OK" if the API is up and the Multichain service is
   * reachable; "503 Service unavailable." otherwise.
   */

  server.get("/readiness",
    {
      beforeHandler: [server.authenticate]
      schema: {
        description: "Returns '200 OK' if the API is up and the Multichain service is",
        tags: ["system"],
        summary: "readiness",
        response: {
          200: {
            description: "Succesful response",
            type: "string"
          },
          503: {
            description: "Blockchain not ready",
            type: "string"
          }
        }
      }
    } as Schema,
    async (request, reply) => {
      console.log(request)
      if (await isReady(multichainClient)) {
        reply.status(200).send("OK");
      } else {
        reply.status(503).send("Service unavailable.");
      }
  });


  return server;
};
