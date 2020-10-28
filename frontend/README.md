# Frontend

This is the frontend, which consumes the exposed Trubudget API.

## Environment Variables

### Frontend

| Env Variable      | Default Value | Description                                                                                                                                                          |
| ----------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NODE_ENV          | -             | If set to `development` search Trubudget's external services (Email-/Excel-Export-Service) on localhost. <br>If set to `production` disable Redux devtools extension |
| REACT_APP_VERSION | -             | Injected version via `$npm_package_version` in`.env` file to ensure the version is shown in the frontend                                                             |
| PROD_API_HOST     | -             | IP address of the api with production environment. This is only required if nginx proxy is used <br>**Hint:** When deployed locally the host is set to localhost     |
| PROD_API_PORT     | 8080          | Port of the api with production environment. This is only required if nginx proxy is used                                                                            |
| TEST_API_HOST     | -             | IP address of the api with test environment. This is only required if nginx proxy is used. <br>**Hint:** When deployed locally the host is set to localhost          |
| TEST_API_PORT     | 8080          | Port of the api with test environment. This is only required if nginx proxy is used                                                                                  |

### Email-Service

| Env Variable                    | Default Value | Description                                                                                                                                                    |
| ------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REACT_APP_EMAIL_SERVICE_ENABLED | -             | When enabled, the frontend requests a email-service readiness call when entering the login screen.<br>If true the email section in the user-profile is enabled |
| EMAIL_HOST                      | -             | IP address of the email notification service                                                                                                                   |
| EMAIL_PORT                      | -             | Port of the email notification service                                                                                                                         |

### Excel-Export-Service

| Env Variable                     | Default Value | Description                                                                                                                                        |
| -------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| REACT_APP_EXPORT_SERVICE_ENABLED | -             | If true the frontend requests a export-service readiness call when entering the login screen and <br>the export button is shown at the side navbar |
| EXPORT_HOST                      | -             | IP address of the excel export service                                                                                                             |
| EXPORT_PORT                      | -             | Port of the excel export service                                                                                                                   |

## Peer dependencies

This project is based on the `create-react-app` starter kit provided by the Facebook Incubator. The main part of the project configuration is encapsulated into the `create-react-app` and not accessible. If you need to access project configuration you can eject the project, which will then move the configuratin into the project. More informations here: https://github.com/facebookincubator/create-react-app

## Production vs. Development Mode

It is common for Modern Single Page Application to run in in different modes. This also apply to the TruBudget frontend. We decide between:

- Development Mode: Is started with node and offers JIT, Hot Reloading and Debug Logging. The node process spawns an own webserver, performance is degraded but developer experience is best
- Production Mode: Application is pre-build and transpiled to an ES5 Version of Javascript (compatible with a variety of browser), no log output, optmized file-sized. The production mode outputs static files which need to be hosted on a seperate webserver (in our case NGINX). Performance is best, developer experience (due to compiling and deployment to separate server) lowest.

It is possible to check the mode inside the Javascript Code by checking `process.env.NODE_NEV` with will return `development` or `production` depending on the mode.

### Using the frontend in Development Mode

When actively developing the frontend, it makes sense to do so in the Development mode. Developing the frontend brings two challenges:

- Quickly add or adapt functionality in the frontend
- Interact with the frontend to test the changes (and therefore attach it to an API)

#### Install & Run the Frontend

Running the frontend on your machine is pretty easy. Please ensure you have an up to date version of `node (>= 8.9.0)`.

If you have `yarn` installed:

```bash
yarn install
yarn start
```

or, if you have `npm` installed:

```bash
npm install
npm start
```

After some compilation it will open the browser and load the frontend. But the first thing you will realize, the frontend won't allow you to do much. You need a "backend" (therefore an API + BC) to make the frontend work.

Dont panic, simply run `./startDev` which will spawn up a dummy-backend, which is configured to work seemlessly with your frontend.

#### Proxy the API calls of the Frontend

The frontend needs to talk to the API, but since the Frontend is hosted in its own and separate NodeJS environment, accessing the API will result in a CORS error. To make development easier, the node environment is able to proxy API requests (more here).

Therefore adapt the route to your api in the `package.json` file.

```json
  "proxy": "http://localhost:33331"
```

If you are using `./startDev` the proxy is already correctly configured for you.

If you get an authentication error because you are not logged into the registry. Simply create a login token by `$ echo $DOCKER_PASSWORD > DOCKER_REGISTRY_PASSWORD`

### Using the frontend in Production Mode

Modern Single Page Applications need to be transpiled to be compatible to older browser versions. On top of that, the Application is minimized, uglyfied and bundled into a single file for maximum performance. You can create a production build by:

```bash
yarn build
```

or, if you have `npm` installed:

```bash
npm run build
```

This will create a production build of the application which will be located in the `build/` folder. The content of the folder needs to be simply put on a webserver. If you are interested on how your application performs in production mode, you can simply use the `Dockerfile`.

```bash
docker build -t trubudget-frontend .
docker run -p 80:80 -it trubudget-frontend
```

This will build the application and run it in an NGINX webserver which is accesible under `http://localhost/`
Similar to the development mode we need to proxy the API calls.

#### Reverse proxying API in NGINX

In production we use NGINX to act as reverse-proxy. That means, the browser will request `http://localhost/` for static resources (like the html, js, images) which will be served by NGINX. On top of that, the Application will try to connect to the API through `http://localhost/api` which obviously cant be served through NGINX (in fact the API might run _somewhere_).

The solution is to proxy the calls to the designated API's (e.g. API or Test-API). This can be done by configuring the `nginx.conf` file.

If you take a look at the NGINX config `nginx.conf` you will see that the proxy is not configured. Thats because we run a script to configure the API locations dynamically when the Dockerfile is running (see `configureServer.sh`).

The Proxy Paths are defined through 4 environment variables of the container:

- PROD_API_HOST (default: `localhost`)
- PROD_API_PORT (default: `8080`)
- TEST_API_HOST (default: `localhost`)
- TEST_API_PORT (default: `8080`)

That means, running the following docker commands

```bash
docker build -t trubudget-frontend .
docker run \
  -p 80:80 \
  -e PROD_API_HOST=127.0.0.1 \
  -e PROD_API_PORT=8081 \
  -e TEST_API_HOST=127.0.0.2 \
  -e TEST_API_PORT=8082 \
  -it trubudget-frontend
```

will result in the following `nginx.conf` file.

```Nginx
location ^~ /api/ {
  proxy_pass http://api:8080/;
}
location ^~ /test/ {
  proxy_pass http://testapi:8080/;
}
```

Here you can see how NGINX is reverse-proxing the requests to the API and TEST-API endpoints to the respective APIs. If you run the API's under a seperate hostname you have to adapt this file.

## Architecture

### `public` Folder

The public folder contains all static assets. During development mode (when started with `npm start`) the content is accesible under `http://adress/`.

### `src` Folder

All Javascript code which needs to be transpiled _must_ be in this folder. During build it will be transpiled and bundled and included into the index HTML file

Inside the `src` folder the Javascript files are seperated into a `pages` directory and plain javascript files (e.g. `api.js`). The `pages` directory contains all code which is specific to certain pages on the frontend (e.g. Notification Page). The plain javascript files are covering logic which is needed across several pages (e.g. API, Stores).

## State management

[Redux](http://redux.js.org/docs/introduction/) is the state management library of choice. In general the complete state of the application is running through the Flux-like flow of Redux.

### Redux Components

The main store and root reducer is defined in `src/store.js` and `src/reducers`. When adding new pages, and in therefore new reducers, you need to add them to the root reducer.

In general the essential building blocks of redux (e.g. actions, reducers) are inside the page specific folders (e.g. `src/pages/Navigation/actions.js`). To use redux together with React wie use

### Code styling

Indenting and formatting rules are described in the `.editorconfig` which can be found inside the root folder. Make sure using an editor which can read EditorConfigs (e.g. Atom, Visual Studio Code).

Linting is done through ESLint but the configuration is abstracted away through the `create-react-app` interface.

## User Management

The initial users are bootstraped via API when the applications are started and if you want to add additional users the frontend provides an admin dashboard. The admin dashboard is reachable via Login Page or directly on the `/admin` endpoint.
Use the admin credentials to login onto the dashboard. If `BC_ADDRESS_VERIFICATION` is disabled each frontend with the corresponding blockchain node is able to add users and roles, otherwise if `BC_ADDRESS_VERIFICATION` is enabled only blockchain nodes with admin rights are allowed to add users and roles.

## Email notifications

To enable/disable email notifications for blockchain simply set the `REACT_APP_EMAIL_SERVICE_ENABLED` to "true" or unset it.
When enabled the frontend requesting a email-notifcations readiness call when entering the login screen. If the email notification service is ready the email section in the user profile is activated and visible so the user can create/edit the email-address where he/she wants to get notifications to. More details about the email notification service can be found in the [email notification documentation](../email-notification/README.md#)
