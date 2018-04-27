import * as express from "express";
import { AuthToken } from "../authz/token";
import {
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined,
  AuthenticatedRequest
} from "../httpd/lib";
import { MultichainClient, SubprojectOnChain } from "../multichain";
import { SubprojectDataWithIntents } from "../multichain/resources/subproject";
import { value, isNonemptyString } from "../lib";

export const getSubprojectList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

  const subprojects: SubprojectDataWithIntents[] = await SubprojectOnChain.getAllForUser(
    multichain,
    req.token,
    projectId
  );

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        items: subprojects
      }
    }
  ];
};
