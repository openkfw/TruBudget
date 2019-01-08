/**
 * DEPRECATED - see index.ts
 */
import { HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import * as Subproject from "../../subproject/model/Subproject";
import * as Project from "../model/Project";

export async function getProjectHistory(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

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
        events,
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
