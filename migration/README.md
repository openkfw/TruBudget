# TruBudget Migration Script

### Migrate an existing TruBudget instance to a new instance

1. Create a backup of your old TruBudget instance. Make sure the source instance uses version 1.30.0
2. Download the latest TruBudget release (2.x), this instance will be the destination instance.
3. With the release of TruBudget 2.0, some environment variables changed. Make sure to adapt the `.env` file on the
   destination instance to your need. If you are not already using the operation script now it's a great chance to start
   using it!
4. Set the following environment variables in the .env file of the destination instance

- `AUTOSTART: false`
- `NODE_ENV: development`

7. Use the operation script to bootstrap the new set-up. Make sure to enable all desired features. If you store documents on TruBudget instance, you must enable the document feature as documents will not be stored on chain!
8. Copy the `.env.example` of the migration script to `.env` & set all variables accordingly.
9. Run the migration script using `npm run build && npm run start`
10. Once the migration finished make sure to set following environment variables on the destination instance by
    changing the `.env` file
    - `AUTOSTART: true`
    - `NODE_ENV: production`

#### Environment Variables

In the following the required environment variables can be found. All the described variables are required variables.
Most of them can be found in

| Env Variable                    | Description                                      |
| ------------------------------- | ------------------------------------------------ |
| DESTINATION_API_BASE_URL        | The base url of the destination api              |
| SOURCE_RPC_PORT                 | The RPC port of the source multichain            |
| SOURCE_RPC_USER                 | The RPC user of the source multichain            |
| SOURCE_RPC_PASSWORD             | The RPC password of the source multichain        |
| SOURCE_RPC_HOST                 | The host of the source multichain                |
| DESTINATION_RPC_PORT            | The RPC port of the destination multichain       |
| DESTINATION_RPC_USER            | The RPC user of the destination multichain       |
| DESTINATION_RPC_PASSWORD        | The RPC password of the destination multichain   |
| DESTINATION_RPC_HOST            | The host of the destination multichain           |
| BACKUP_FILE_LOCATION            | The **absolute path** to the backup file         |
| DESTINATION_BLOCKCHAIN_BASE_URL | Base url of the blockchain                       |
| ROOT_SECRET                     | The root users password                          |
| ORGANIZATION                    | The name of the organization you want to migrate |
| MIGRATION_USER_PASSWORD         | The password used for the migration user         |

#### FAQ

- **Will the migrated data be modified during migration?** No, per default the data remains untouched. You can adapt
  some parameters tho if you want to. For this head over to the development section.
- **Does the user see, that a migration happened?** Yes, there will be marker in the history tab of every workflow item,
  indicating that the data has been copy to the chain via a script.
- **Why does the user need to see that a migration happened?** One of the main reasons for using blockchains, is the
  fact, that once the data is written, no one can edit the data anymore. If data gets copied form one instance to
  another, it's important that the user knows this has happened to provide a layer of transparency.
- **Why upgrade anyway to 2.x (or further)?** As we continuously work on improving TruBudget, we sometimes have to make
  big changes to the system which are not compatible with prior versions of TruBudget. For more information have a look
  at the TruBudget Changelog

### Development

#### Structure

```
.
├── src/
│   ├── customMigration: custom migration procedures for different streams
│   ├── helper: a collection of helper
│   ├── types: type definitions
│   ├── assert: a collection of methods to check if sour & destination data is the same
│   ├── migrate : core logic  migration process is managed here
│   ├── index: entry point
│   └── rpc: abstraction  to interact with multichain
└── .env.example: example of the enviroment variables
```

#### Run

1. Follow step "Migrate an existing TruBudget instance to a new instance" to create all required instances
2. Set env variables
3. Run via:
   `npm i`
   `npm run dev`
4. Happy coding!

#### The migration function

By default, the function `migrate` copy all stream items on each stream on the chain and check that the data filed on
the destination chain has not been changed. In some cases this behavior is not desired since the data should not be
copied to the chain but rather written by the API to the chain.
For this reason, the migration function accepts an additional parameter `customMigrations`.
Here you can pass your own migration function to the script. A custom migration function consists of a `stream`
, `function` and
a `verifyer`. The `stream` describes for which stream the function will be applied. The `function` is the responsible
for moving the stream item from one chain to another. The `verifyer` is responsible for asserting the correctness of the
moved stream item on the destination chain (or API depending on what you want to move / assert).

There are two custom migration functions implemented by default which handle the transfer of files. These can be
used as example for future implementations.
