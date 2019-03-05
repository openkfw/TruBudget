import { Cache } from "./cache";
import { Cache2 } from "./cache2";
import { MultichainClient } from "./Client.h";

/**
 * Opaque token that carries connection state.
 */
export type ConnToken = {
  multichainClient: MultichainClient;
  cache: Cache;
  cache2: Cache2;
};
