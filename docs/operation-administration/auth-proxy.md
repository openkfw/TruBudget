# Auth Proxy

## Motivation 

Organization's users want to use their credentials for authentication and authorization, but use a TruBudget user account for interacting with the application. 
Since TruBudget's data store is a blockchain, once personal data is entered, it is practically impossible to delete.

## Setup

Auth Proxy exchanges a token in the form of a cookie for TruBudget's access token. For this reason, **Auth Proxy needs to be registered in the same domain as the deployed TruBudget instance**.

## Configuration

There are several environment variables that need to be set in the api and frontend, if you want to use the Auth Proxy.

In the API:

- AUTHPROXY_ENABLED has to be set to `true`.

- AUTHPROXY_JWS_SIGNATURE is a secret used to verify JWT stored in a cookie received from the Auth Proxy. Has the same value as the secret configured in Auth Proxy.

In the frontend:

- REACT_APP_AUTHPROXY_ENABLED has to be set to `true`.
- REACT_APP_AUTHPROXY_URL is a URI string of a location where the user is redirected for sign in via proxy. Typically *host(:port)*`/signin` on the same domain as TruBudget.

## 