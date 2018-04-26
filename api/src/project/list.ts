import * as express from "express";
import { AuthToken } from "../authz/token";
import {
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined,
  AuthenticatedRequest
} from "../httpd/lib";
import { MultichainClient } from "../multichain";
import * as Project from ".";

export const getProjectList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const projects = await Project.getAllForUser(multichain, req.token);
  const clearedProjects = projects.filter(project =>
    project.allowedIntents.includes("project.viewSummary")
  );

  return [
    200,
    {
      apiVersion: "1.0",
      data: { items: clearedProjects }
    }
  ];
};
