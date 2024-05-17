import { config } from "config";
import { RouteShorthandOptions } from "fastify";

export const silentRouteSettings = (
  routeSettings: RouteShorthandOptions,
): RouteShorthandOptions => {
  if (config.silenceLoggingOnFrequentRoutes) {
    return { ...routeSettings, logLevel: "warn" };
  }
  return routeSettings;
};
