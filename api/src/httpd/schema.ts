import * as fastify from "fastify";

export interface SwaggerSchema extends fastify.RouteSchema {
  description: string;
  tags: string[];
  summary: string;
}

export interface Schema {
  schema: SwaggerSchema;
}
