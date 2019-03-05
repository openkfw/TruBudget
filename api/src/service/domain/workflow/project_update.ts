import Joi = require("joi");

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { sourceProjects } from "./project_eventsourcing";
import * as ProjectUpdated from "./project_updated";

export interface RequestData {
  displayName?: string;
  description?: string;
  thumbnail?: string;
}

const requestDataSchema = Joi.object({
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  thumbnail: Joi.string().allow(""),
}).or("displayName", "description", "thumbnail");

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getProjectEvents(): Promise<BusinessEvent[]>;
}

export async function updateProject(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  data: RequestData,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
  const projectEvents = await repository.getProjectEvents();
  const { projects } = sourceProjects(ctx, projectEvents);

  const project = projects.find(x => x.id === projectId);
  if (project === undefined) {
    return { newEvents: [], errors: [new NotFound(ctx, "project", projectId)] };
  }

  // Create the new event:
  const projectUpdated = ProjectUpdated.createEvent(ctx.source, issuer.id, projectId, data);

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    if (!Project.permits(project, issuer, ["project.update"])) {
      return {
        newEvents: [],
        errors: [new NotAuthorized(ctx, issuer.id, projectUpdated)],
      };
    }
  }

  // Check that the new event is indeed valid:
  const { errors } = sourceProjects(ctx, projectEvents.concat([projectUpdated]));
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, projectUpdated, errors)] };
  }

  return { newEvents: [projectUpdated], errors: [] };
}
