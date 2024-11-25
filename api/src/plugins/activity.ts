import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

import { config } from "../config";
import { AuthenticatedRequest } from "../httpd/lib";
import { kvStore } from "../lib/keyValueStore";
import logger from "../lib/logger";

async function activityTrackingPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
): Promise<void> {
  fastify.addHook("preHandler", async (request: AuthenticatedRequest, reply) => {
    // if userId in request, set timestamp of last activity, except for routes defined in options.excludePaths (for example, user.refreshtoken, notification.list,...)
    const excludedPaths = options.excludePaths.map((p) => (p as string).toLowerCase()) || [];
    if (excludedPaths.includes(request.routerPath.toLowerCase())) {
      return;
    }

    if (request.user) {
      try {
        const userId = request.user?.userId;
        if (config.refreshTokenStorage === "memory") {
          kvStore.save(`lastActivity.${userId}`, Date.now(), Date.now() + 1000 * 60 * 60 * 24);
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
    logger.error("***** checkIdleUsers running");
    try {
      if (config.refreshTokenStorage === "memory") {
        // go through all stored lastAccesses
        const unexpired = kvStore.getAll();
        for (const [k, v] of unexpired) {
          logger.error(`***** store: ${k} ${v}`);
          if (k.includes("lastActivity.")) {
            // if lastActivity value is older then defined, invalidate refresh token
            if (Date.now() > (v as number) + config.userIdleTime * 60 * 1000) {
              const userId = k.split(".")[1];
              logger.error(`***** found inactive user ${userId}`);
              kvStore.clear(`lastActivity.${userId}`);
            }
          }
        }
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
  const intervalId = setInterval(checkIdleUsers, 60 * 1000);

  // cleanup
  fastify.addHook("onClose", () => {
    clearInterval(intervalId);
  });
}

export default fp(activityTrackingPlugin, { name: "activity-plugin" });
