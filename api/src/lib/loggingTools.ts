import { RouteShorthandOptions } from "fastify";

import { config } from "../config";

export const silentRouteSettings = (
  routeSettings: RouteShorthandOptions,
): RouteShorthandOptions => {
  if (config.silenceLoggingOnFrequentRoutes) {
    return { ...routeSettings, logLevel: "warn" };
  }
  return routeSettings;
};
