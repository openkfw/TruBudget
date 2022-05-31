/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from "fastify";

/**
 * Interface representing an extended fastify instance
 */
export interface AugmentedFastifyInstance extends FastifyInstance {
  authenticate: any;
  swaggerCSP: any;
}
