import { Cache } from "./cache/index";

import { MultichainClient } from "./Client.h";

/**
 * Opaque token that carries connection state.
 */
export type ConnToken = {
  multichainClient: MultichainClient;
  cache: Cache;
};
