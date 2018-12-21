import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value, isNumber } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import * as Subproject from "../../subproject/model/Subproject";
import * as Project from "../model/Project";
import logger from "../../lib/logger";

export async function getProjectHistory(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const offset: number = value("offset", parseInt(input.offset, 10), isNumber);
  const limit: number = value("limit", parseInt(input.limit, 10), isNumber);

  logger.fatal({ projectId, offset, offsetType: typeof(offset), limit, limitType: typeof(limit) });

  const project = await Project.get(multichain, req.user, projectId).then(
    resources => resources[0],
  );

  // Add subprojects' logs to the project log and sort by creation time:
  const subprojects = await Subproject.get(multichain, req.user, projectId);
  const events = subprojects
    .reduce((eventsAcc, subproject) => eventsAcc.concat(subproject.log), project.log)
    .sort(compareEvents);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        events: events.slice(offset, offset + limit),
      },
    },
  ];
}

function compareEvents(a: Event, b: Event): number {
  const tsA = new Date(a.createdAt);
  const tsB = new Date(b.createdAt);
  if (tsA < tsB) return 1;
  if (tsA > tsB) return -1;
  return 0;
}
