# How to work with the API

We created a frontend to use TruBudget and interact with the blockchain, but we also created an API that handles all the interactions and contains all the business logic. If you don't like to use frontends or if you want to connect TruBudget to other existing systems, the API is your friend.

## How to use the API

> Note: for the examples in this guide, TruBudget was [started locally](../contribute/Contributor-Guide.md) and the API_PORT is set to `8080`.

### Calling the API

The API is a collection of REST endpoints that can be called via http or https. Example

```bash
curl -X GET http://localhost:8080/api/readiness
```

which returns `OK`.

The documentation for this endpoints is generated with each deployment of the API and can be accessed via the browser. It is usually deployed at `http://address.of.deployment/test/api/documentation/static/index.html`, here are some examples:

- Developer setup: http://localhost:8080/api/documentation/static/index.html
- Local deployment via Docker-Compose: http://localhost/test/api/documentation/static/index.html
- Deployment on server: http://52.52.52.52/test/api/documentation/static/index.html

### Using Postman

One tool that can be used for REST calls is called [Postman](https://www.getpostman.com/). There is a [collection of API calls](https://github.com/openkfw/TruBudget/blob/master/api/postman/TruBudget.postman_collection.json) ready to be imported into Postman.

## How to Contribute

The API is structured into layers (application layer, service layer, domain layer) and each of these layers has its own language. There is a README file in each of the layers, where the structure of the API and the current layer is described in detail. You can start [here](https://github.com/openkfw/TruBudget/blob/master/api/src/README.md) to get detailed information.
