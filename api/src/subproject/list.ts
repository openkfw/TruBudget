import * as express from "express";
import { AuthToken } from "../authz/token";
import {
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined,
  AuthenticatedRequest
} from "../httpd/lib";
import { MultichainClient, SubprojectOnChain } from "../multichain";
import { SubprojectUserView } from "../multichain/resources/subproject";

export const getSubprojectList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const projectId = req.query.project;
  if (!projectId) throwParseError(["projectId"]);
  return [
    200,
    {
      apiVersion: "1.0",
      data: await list(multichain, req.token, projectId)
    }
  ];
};

const list = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string
): Promise<SubprojectUserView[]> => {
  const subprojects: SubprojectUserView[] = await SubprojectOnChain.getAllForUser(
    multichain,
    projectId,
    token
  );

  const clearedSubprojects = subprojects.filter(subproject =>
    subproject.allowedIntents.includes("subproject.viewSummary")
  );

  return clearedSubprojects;
};
