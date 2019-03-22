# TruBudget Provisioning

Initialize a newly created TruBudget node (MultiChain + API) with data. The script can handle multiple environments, which can be defined using JSON files in `src/data/<ENVIRONMENT>/` and selected using the environment variable `ENVIRONMENT_TYPE`.

First, install the dependencies:

```bash
npm install
```

Then run the script. You need to supply the `ORGANIZATION` and the `ROOT_SECRET` as configured with the API. Using the `test` environment:

```bash
ORGANIZATION=myorga ROOT_SECRET=my-secret npm start
```

Alternatively, use it to provision the `prod`uction data:

```bash
ORGANIZATION=myorga ROOT_SECRET=my-secret ENVIRONMENT_TYPE=PROD npm start
```

By default, the script expects the API to listen on `127.0.0.1:8080`, but this can be customized using the `API_HOST` and `API_PORT` environment variables.
