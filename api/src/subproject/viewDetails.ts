import { AuthenticatedRequest, HttpResponse, throwParseError } from "../httpd/lib";
import { isNonemptyString } from "../lib";
import { MultichainClient, SubprojectOnChain } from "../multichain";
import * as Workflowitem from "../workflowitem";
import { SubprojectDataWithIntents } from "../multichain/resources/subproject";

const value = (name, val, isValid) => {
  if (isValid !== undefined && !isValid(val)) {
    throwParseError([name]);
  }
  return val;
};

export const getSubprojectDetails = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const projectId = value("projectId", req.query.projectId, isNonemptyString);
  const subprojectId = value("subprojectId", req.query.subprojectId, isNonemptyString);

  const resource: SubprojectDataWithIntents = await SubprojectOnChain.getForUser(
    multichain,
    req.token,
    projectId,
    subprojectId
  );

  const workflowitems: Workflowitem.DataWithIntents[] = await Workflowitem.getAllForUser(
    multichain,
    req.token,
    projectId,
    subprojectId
  );
  console.log("resource", JSON.stringify(resource));
  console.log("items", JSON.stringify(workflowitems));

  return [200, { apiVersion: "1.0", data: { ...resource, workflowitems } }];
};
