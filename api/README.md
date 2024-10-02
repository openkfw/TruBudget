# TruBudget-API

## Setup

### Development

Check out our [ADRs](../doc/adr/) to learn about our current way of doing things.

#### Get started

Before starting the API, environment variables have to be set under `.env` file. The `.env.example` file provides the default/example values for the environment variables. Just make a copy of example file via:

```bash
cp .env.example .env
```

Default values are usually enough to setup a working local Trubudget instance. However you are free to change the variable values under .env file.

When not yet provisioned, it's recommended to start the server directly with node:

```bash
npm run tsc && npm start
```

After that, live-reloading doesn't hinder provisioning anymore, plus it's quite convenient, so you might want to use this instead:

```bash
npm run dev
```

#### Run tests

```bash
npm test
```

#### Build a container

```bash
docker build .
```

#### Code Structure

In the [README](./src/README.md) under source folder, you can find information about the best practices, code structure and layout for the api.

### API Swagger documentation

The documentation is hosted by the API itself. Assuming it's running on your local machine on port 8080, you should see it at [localhost:8080/api/documentation](http://localhost:8080/api/documentation).

### API code documentation

For code documentation the API is using [TypeDoc](https://typedoc.org).
To generate the documentation in `docs/developer/api-docs` use following commands:

```
cd api
npm install
npm run build-docs
```

After executing the above commands the `api-docs` folder is create in `docs/developer/api-docs`
This folder is used by the project [trubudget-website](https://github.com/openkfw/trubudget-website) to show all documented functions of TruBudget's API.
To check out how it looks like in production checkout [trubudget.net](https://trubudget.net/docs/developer/api-docs/modules/).
To locally spin up the trubudget-website with the build-docs folder copy the `build-docs` folder into `trubudget-website/docs/developer/` before starting the website locally with `npm start`.

Currently only domain layer functions are documented. If [#1164](https://github.com/openkfw/TruBudget/issues/1164) is resolved the entire api will be documented.

## Environment Variables

In TruBudget, we use different environment variables to set credentials as well as configurations of the TruBudget services. The environment variables used in the API can be seen here [Environment Variables](./environment-variables.md)
