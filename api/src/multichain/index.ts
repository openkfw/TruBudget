import * as Global from "./resources/global";
export { Global as GlobalOnChain };

import * as Project from "./resources/project";
export { Project as ProjectOnChain };

import * as Subproject from "./resources/subproject";
export { Subproject as SubprojectOnChain };

export { MultichainClient, RpcMultichainClient, Stream, StreamItem, StreamTxId } from "./Client.h";
