/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance } from "fastify";

export interface AugmentedFastifyInstance extends FastifyInstance {
  authenticate: any;
  swaggerCSP: any;
}
