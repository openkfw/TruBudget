import * as parseSwagger from 'swagger-to-joi';
import * as sw2dts from 'sw2dts';

import { mkSwaggerSchema } from './project_update';


const fastifyMock = {
  authenticate: '',
};

const generate = () => {
  const swagger = mkSwaggerSchema(fastifyMock as any);
  const joi = parseSwagger(swagger.schema, undefined, '2.0');

  console.log(joi.body);

  console.log(`

---

  `);

  const data: sw2dts.SwaggerSpec = {swagger: '2.0', definitions: { requestBodyV1: swagger.schema.body as any}};

  const option: sw2dts.ConverterOptions = {

    // includes GET query parameters.
    withQuery: true,

};

  sw2dts.convert(data, option).then((dts) => {
    console.log(dts);
  });
};

generate();
