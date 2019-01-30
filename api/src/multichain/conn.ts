import { Cache } from "./cache";
import { MultichainClient } from "./Client.h";

/**
 * Opaque token that carries connection state.
 */
export type ConnToken = {
  multichainClient: MultichainClient;
  cache: Cache;
};
