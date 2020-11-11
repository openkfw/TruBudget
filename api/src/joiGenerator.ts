import * as parseSwagger from 'swagger-to-joi';
import { mkSwaggerSchema } from './project_update';


const fastifyMock = {
  authenticate: '',
};

const generate = () => {
  const swagger = mkSwaggerSchema(fastifyMock as any);
  const joi = parseSwagger({parameters: [swagger.schema.body]}, undefined, '2.0');

  console.log(joi);
};

generate();
