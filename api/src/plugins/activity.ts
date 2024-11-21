import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";

import { AuthenticatedRequest } from "../httpd/lib";

async function activityTrackingPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
): Promise<void> {
  fastify.addHook("preHandler", async (request: AuthenticatedRequest, reply) => {
    // if user id in request, set last activity
    if (request.user) {
      try {
        const userId = request.user?.userId;
      } catch (err) {
        //logger.error({ err }, `preHandler failed to get groups for user ${request.user?.userId}`);
      }
    }
  });

  // background job to check idle users
  const checkIdleUsers = async (): Promise<void> => {
    for (let i = 0; i < 1; i++) {}
  };

  // run job every X minutes - setInterval
  const intervalId = setInterval(checkIdleUsers, 5 * 60 * 1000);

  // cleanup
  fastify.addHook("onClose", () => {
    clearInterval(intervalId);
  });
}

export default fp(activityTrackingPlugin, { name: "activity-plugin" });
