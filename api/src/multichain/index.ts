import * as Global from "./resources/global";
export { Global as GlobalOnChain };

import * as Project from "./resources/project";
export { Project as ProjectOnChain };

import * as Subproject from "./resources/subproject";
export { Subproject as SubprojectOnChain };

import * as Workflowitem from "./resources/workflowitem";
export { Workflowitem as WorkflowitemOnChain };

export {
  MultichainClient,
  RpcMultichainClient,
  Stream,
  StreamBody,
  StreamItem,
  StreamTxId
} from "./Client.h";
