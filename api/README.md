# TruBudget

## Setup

### Development

Check out our [the ADRs](../doc/adr/) to learn about our current way of doing things.

HTTP.Project <- Multichain.Project <- Project.Project -> Notification.Project

#### Get started

When not yet provisioned, it's recommended to start the server directly with node:

```bash
npm run tsc && node dist/index.js
```

After that, live-reloading doesn't hinder provisioning anymore, plus it's quite convienent, so you might want to use this instead:

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

### API documentation

The documentation is hosted by the API itself. Assuming it's running on your local machine on port 8080, you should see it at [localhost:8080/api/documentation](http://localhost:8080/api/documentation).

If Trubudget is running in test or production an additional environment variable has to be set to ensure that the api documentation is working correctly.

In case of production the variable has to be set to "/prod":

```bash
export SWAGGER_BASEPATH = "/prod"
```

In case of test the variable has to be set to "/test":

```bash
export SWAGGER_BASEPATH = "/test"
```
