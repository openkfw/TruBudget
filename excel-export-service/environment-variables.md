# Trubudget Email Service

## Environment Variables

| Env Variable name               | Required | Default Value | Description                                                                                                                                                                                                                                                 |
| ------------------------------- | -------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API_HOST**                    | no       | localhost     | Hots/IP address of the API service.                                                                                                                                                                                                                         |
| **API_PORT**                    | no       | 8080          | Port of the API service. Value is a port with minimal value 0 and maximal value 65535                                                                                                                                                                       |
| **API_PROTOCOL**                | no       | http          | Protocol of the API service.                                                                                                                                                                                                                                |
| **PORT**                        | no       | 8888          | The port used to expose the excel-export service. Value is a port with minimal value 0 and maximal value 65535                                                                                                                                              |
| **ACCESS_CONTROL_ALLOW_ORIGIN** | no       | *             | Since the export service uses CORS, the domain by which it can be called needs to be set. Setting this value to `` means that it can be called from any domain. Read more about this topic [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).  |
| **RATE_LIMIT**                  | no       | -             | Defines the limit each IP to 'RATE_LIMIT' requests per windowMs (1 minute)                                                                                                                                                                                  |
| **NODE_ENV**                    | no       | production    | -                                                                                                                                                                                                                                                           |
| **LOG_LEVEL**                   | no       | info          | Defines the log output.                                                                                                                                                                                                                                     |
| **CI_COMMIT_SHA**               | no       | -             | Defines the CI_COMMIT_SHA property returned by the version endpoint.                                                                                                                                                                                        |
| **BUILDTIMESTAMP**              | no       | -             | Defines the BUILDTIMESTAMP property returned by the version endpoint.                                                                                                                                                                                       |

#### JWT_SECRET

The JWT_SECRET is shared between Trubudget's blockchain api and email-service. The endpoints of the email-service can
only be used by providing a valid JWT_TOKEN signed with this JWT_SECRET. Since the blockchain is using the notification
endpoints and the ui is using the user endpoints the secret has to be shared.
