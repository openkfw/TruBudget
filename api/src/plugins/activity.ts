import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

import { config } from "../config";
import { AuthenticatedRequest } from "../httpd/lib";
import { kvStore } from "../lib/keyValueStore";

// todo should not run in refreshtoken route
async function activityTrackingPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
): Promise<void> {
  fastify.addHook("preHandler", async (request: AuthenticatedRequest, reply) => {
    // if user id in request, set last activity
    if (request.user) {
      try {
        const userId = request.user?.userId;
        if (config.refreshTokenStorage === "memory") {
          // TODO save, update last activity
          kvStore.save(`lastActivity.${userId}`, Date.now(), Date.now() + 1000 * 60 * 10);
        } else if (config.refreshTokenStorage === "db") {
          // create or update last access for userId
        }
      } catch (err) {
        //logger.error({ err }, `preHandler failed to get groups for user ${request.user?.userId}`);
      }
    }
  });

  // background job to check idle users
  const checkIdleUsers = async (): Promise<void> => {
    try {
      if (config.refreshTokenStorage === "memory") {
        // go through all stored lastAccesses
        // invalidate refreshTokens of users with last activity older than X
      } else if (config.refreshTokenStorage === "db") {
        // get all last accesses
        // invalidate refreshTokens of users with last activity older than X
      }
    } catch (err) {
      //logger.error({ err }, `preHandler failed to get groups for user ${request.user?.userId}`);
    }
  };

  // run job every X minutes - setInterval
  const intervalId = setInterval(checkIdleUsers, 5 * 60 * 1000);

  // cleanup
  fastify.addHook("onClose", () => {
    clearInterval(intervalId);
  });
}

export default fp(activityTrackingPlugin, { name: "activity-plugin" });
