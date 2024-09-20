| Env Variable name | Required | Default Value | Description |
|------------------|----------------------|---------------|-------------|
| ORGANIZATION | yes | - | In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain and is also displayed in the frontend's top right corner.  |
| PORT | no | 8091 | The port used to expose the API for your installation.  Example: If you run TruBudget locally and set API_PORT to `8080`, you can reach the API via `localhost:8080/api`.  |
| ORGANIZATION_VAULT_SECRET | yes | - | This is the key to en-/decrypt user data of an organization. If you want to add a new node for your organization, you want users to be able to log in on either node.  **Caution:** If you want to run TruBudget in production, make sure NOT to use the default value from the `.env_example` file! Invalid values: secret. |
| ROOT_SECRET | yes | aaba5fcbe677fc0d952c29d8928d283601a6e26ae84149185feb45fd81785f63 | The root secret is the password for the root user. If you start with an empty blockchain, the root user is needed to add other users, approve new nodes,.. If you don't set a value via the environment variable, the API generates one randomly and prints it to the console  **Caution:** If you want to run TruBudget in production, make sure to set a secure root secret.  |
| MULTICHAIN_RPC_HOST | no | localhost | The IP address of the blockchain (not multichain daemon,but they are usally the same) you want to connect to.  |
| MULTICHAIN_RPC_PORT | no | 8000 | The Port of the blockchain where the server is available for incoming http connections (e.g. readiness, versions, backup and restore)  |
| MULTICHAIN_RPC_USER | no | multichainrpc | The user used to connect to the multichain daemon.  |
| MULTICHAIN_RPC_PASSWORD | no | s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j | Password used by the API to connect to the blockchain. The password is set by the origin node upon start. Every beta node needs to use the same RPC password in order to be able to connect to the blockchain.  **Hint:** Although the MULTICHAIN_RPC_PASSWORD is not required it is highly recommended to set an own secure one.  |
| BLOCKCHAIN_PORT | no | 8085 | The port used to expose the multichain daemon of your Trubudget blockchain installation(bc). The port used to connect to the multichain daemon(api). This will be used internally for the communication between the API and the multichain daemon.  |
| SWAGGER_BASEPATH`deprecated` | no | - | deprecated This variable was used to choose which environment (prod or test) is used for testing the requests. The variable is deprecated now, as the Swagger documentation can be used for the prod and test environment separately. Example values: /. |
| JWT_ALGORITHM | no | HS256 | Algorithm used for signing and verifying JWTs. Allowed values: HS256, RS256. |
| JWT_SECRET | no | 59cc214d8a8128f72f8f130f71bd4a2c5f6c223ae9ea8b9484055150d1807fbd | A string that is used to sign JWT which are created by the authenticate endpoint of the api. If JWT_ALGORITHM is set to `RS256`, this is required and holds BASE64 encoded PEM encoded private key for RSA.  |
| JWT_PUBLIC_KEY | no | - | If JWT_ALGORITHM is set to `RS256`, this is required and holds BASE64 encoded PEM encoded public key for RSA.  |
| DOCUMENT_FEATURE_ENABLED | no | - | -  |
| DOCUMENT_EXTERNAL_LINKS_ENABLED | no | - | -  |
| STORAGE_SERVICE_HOST | no | localhost | -  |
| STORAGE_SERVICE_PORT | no | 8090 | -  |
| STORAGE_SERVICE_EXTERNAL_URL | no | - | -  |
| EMAIL_HOST | no | localhost | -  |
| EMAIL_PORT | no | 8089 | -  |
| ACCESS_CONTROL_ALLOW_ORIGIN | no | * | -  |
| NODE_ENV | no | production | -  |
| ENCRYPTION_PASSWORD | no | - | -  |
| SIGNING_METHOD | no | node | -  |
| RATE_LIMIT | no | - | - Allowed values: . |
| AUTHPROXY_ENABLED | no | - | -  |
| AUTHPROXY_JWS_SIGNATURE | no | - | -  |
| DB_TYPE | no | pg | -  |
| SQL_DEBUG | no | - | -  |
| API_DB_USER | no | postgres | -  |
| API_DB_PASSWORD | no | test | -  |
| API_DB_HOST | no | localhost | -  |
| API_DB_NAME | no | trubudget_email_service | -  |
| API_DB_PORT | no | 5432 | -  |
| API_DB_SSL | no | - | -  |
| API_DB_SCHEMA | no | public | -  |
| API_REFRESH_TOKENS_TABLE | no | refresh_token | -  |
| REFRESH_TOKEN_STORAGE | no | - | - Allowed values: db, memory. |
| SNAPSHOT_EVENT_INTERVAL | no | 3 | -  |
| SILENCE_LOGGING_ON_FREQUENT_ROUTES | no | - | -  |
| APPLICATIONINSIGHTS_CONNECTION_STRING | no | - | - Allowed values: . |
