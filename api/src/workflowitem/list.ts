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
import { isNonemptyString, value } from "../lib";
import * as Workflowitem from ".";
import Intent from "../authz/intents";

export const getWorkflowitemList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const workflowitems: Array<
    Workflowitem.DataWithIntents | Workflowitem.ObscuredDataWithIntents
  > = await Workflowitem.getAllForUser(multichain, req.token, projectId, subprojectId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        workflowitems
      }
    }
  ];
};
