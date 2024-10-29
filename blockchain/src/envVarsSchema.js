const Joi = require("joi");

const envVarsSchema = Joi.object({
  PORT: Joi.number().port().default(8085).note("This is the port where the multichain can be downloaded (backup)"),
  ORGANIZATION: Joi.string()
    .allow("")
    .empty(["", null])
    .default("MyOrga")
    .note(
      "In the blockchain network, each node is represented by its organization name. This environment variable sets this organization name. It is used to create the organization stream on the blockchain.",
    ),
  MULTICHAIN_RPC_PORT: Joi.number()
    .port()
    .allow("")
    .empty(["", null])
    .default(8000)
    .note(
      "The port used to expose the multichain daemon of your Trubudget blockchain installation(bc). The port used to connect to the multichain daemon(api). This will be used internally for the communication between the API and the multichain daemon.",
    ),
  MULTICHAIN_RPC_USER: Joi.string()
    .allow("")
    .empty(["", null])
    .default("multichainrpc")
    .note("The user used to connect to the multichain daemon."),
  MULTICHAIN_RPC_PASSWORD: Joi.string()
    .allow("")
    .empty(["", null])
    .default("s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j")
    .min(32)
    .note(
      "Password used by the API to connect to the blockchain. The password is set by the origin node upon start. Every beta node needs to use the same RPC password in order to be able to connect to the blockchain. <br/>**Hint:** Although the MULTICHAIN_RPC_PASSWORD is not required it is highly recommended to set an own secure one, at least 32 characters long.",
    ),
  RPC_ALLOW_IP: Joi.string()
    .default("0.0.0.0/0")
    .note(
      "It refers to an allowed IP address range, given either by IP or CIDR notation. 0.0.0.0/0 will allow access from anywhere. ",
    ),
  CERT_PATH: Joi.string()
    .empty("")
    .note(
      "The path to the certificate used by the blockchain to authenticate with the connection peer. Note that self-signed certificates are not allowed in production environments. [More information can be found here](https://www.cloudflare.com/en-gb/learning/access-management/what-is-mutual-authentication/) ",
    ),
  CERT_CA_PATH: Joi.string()
    .empty("")
    .note(
      "The path to the certificate authority root certificate by the blockchain to authenticate with the connection peer. Note that self-signed certificates are not allowed in production environments.[More information can be found here](https://www.cloudflare.com/en-gb/learning/access-management/what-is-mutual-authentication/)",
    ),
  CERT_KEY_PATH: Joi.string()
    .empty("")
    .note(
      "The path to the certificate key used by the blockchain to authenticate with the connection peer. [More information can be found here](https://www.cloudflare.com/en-gb/learning/access-management/what-is-mutual-authentication/)",
    ),
  AUTOSTART: Joi.boolean()
    .default(true)
    .empty("")
    .note("If set to false multichain daemon will not start automatically."),
  EXTERNAL_IP: Joi.string().note(
    "The EXTERNAL_IP option is the IP address with which the current node can be reached. The variable is forwarded to the multichain daemon as `externalip` argument. This will be reported to other nodes in the Trubudget network. By default, daemon will try to automatically detect an external IP address. However, this might not always be accurate, especially if a node is behind a NAT or a firewall. By using EXTERNAL_IP, you can manually specify the IP. This can be useful if you want to ensure that your node is reachable at a specific address. If your node is not actually reachable at the specified IP address (e.g. because of a firewall), other nodes might not be able to connect to it. <br/>Example: If you have a VM running on 22.22.22.22 and you want to start a beta node from this VM to connect to an alpha running on 11.11.11.11, you set `EXTERNAL_IP` to 11.11.11.11 on alpha node and 22.22.22.22 on beta node.",
  ),
  LOG_LEVEL: Joi.string()
    .default("info")
    .allow("fatal", "error", "warn", "info", "debug", "trace", "")
    .empty(["", null])
    .note("Defines the log output."),
  P2P_HOST: Joi.string().note(
    "The IP address of the blockchain node you want to connect to. When given, the node joins the existing network rather than creating its own chain.",
  ),
  P2P_PORT: Joi.number()
    .port()
    .default(7447)
    .note("The port on which the node you want to connect to has exposed the blockchain."),
  API_PROTOCOL: Joi.string()
    .allow("http", "https")
    .default("http")
    .note("The Protocol which should be used to connect to the alpha-node's api."),
  API_HOST: Joi.string()
    .default("localhost")
    .note(
      "Used to build the URL to the alpha-node's API when requesting network access. (The IP addresses are usually the same as for the P2P host address).",
    ),
  API_PORT: Joi.number().port().default(8080).note("The port used to connect to the alpha-node's api."),
  MULTICHAIN_DIR: Joi.string()
    .default("/root")
    .note(
      "The path to the multichain folder where the blockchain data is persisted. For installations via `docker compose`, this refers to the path within the docker container of the blockchain. For bare metal installations, this refers to the path on the machine the blockchain is running on.",
    ),
  EMAIL_HOST: Joi.string()
    .allow("")
    .empty(["", null])
    .when("EMAIL_SERVICE_ENABLED", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .note("The IP address from the email-notification service."),
  EMAIL_PORT: Joi.number()
    .allow("")
    .empty(["", null])
    .when("EMAIL_SERVICE_ENABLED", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .note("The port address from the email-notification service."),
  EMAIL_SSL: Joi.boolean()
    .default(false)
    .empty("")
    .note(
      "If set to `true` the connection between blockchain and email-notification service is https instead of http.",
    ),
  NOTIFICATION_PATH: Joi.string()
    .default("./notifications/")
    .note("The path where notification files shall be saved on the blockchain environment"),
  NOTIFICATION_MAX_LIFETIME: Joi.number()
    .default(24)
    .note("This number configure how long notifications shall be saved in the NOTIFICATION_PATH in hours"),
  NOTIFICATION_SEND_INTERVAL: Joi.number()
    .default(10)
    .note(
      "This number configure in which interval the notifications in the NOTIFICATION_PATH should be checked and send.",
    ),
  JWT_SECRET: Joi.string()
    .allow("")
    .empty(["", null])
    .when("EMAIL_SERVICE_ENABLED", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .note(
      "The `JWT_SECRET` is only required if the Email feature is enabled. It is used to authenticate the blockchain at the email-service, so it can send notifications.",
    ),
  EMAIL_SERVICE_ENABLED: Joi.boolean()
    .default(false)
    .empty("")
    .note("If set to `true` the Email-Service feature is enabled and the EMAIL_* variables are required"),
  MULTICHAIN_FEED_ENABLED: Joi.boolean()
    .default(false)
    .empty("")
    .note(
      "If set to true the multichain-feed go script in src/multichain-feed/multichain-feed is passed to the multichain daemon and executed in a separate process. ",
    ),
  NODE_ENV: Joi.string()
    .allow("")
    .empty(["", null])
    .default("production")
    .note(
      "Environment: Default development when running development-script. Production when running production-script",
    ),
  BLOCKNOTIFY_SCRIPT: Joi.string().note(
    "Configure the blocknotifiy argument of the multichain configuration like -blocknotify=[BLOCKNOTIFY_SCRIPT]",
  ),
  KUBE_SERVICE_NAME: Joi.string().default(""),
  KUBE_NAMESPACE: Joi.string().default(""),
  EXPOSE_MC: Joi.boolean().default(false),
  PRETTY_PRINT: Joi.boolean()
    .default(false)
    .empty("")
    .note(
      "Decides whether the logs printed by the API are pretty printed or not. Pretty printed logs are easier to read while non-pretty printed logs are easier to store and use e.g. in the ELK (Elasticsearch-Logstash-Kabana) stack.",
    ),
  CI_COMMIT_SHA: Joi.string().empty("").note("The /version endpoint returns this variable as `commit` property."),
  BUILDTIMESTAMP: Joi.string()
    .empty("")
    .note("The /version endpoint returns this variable as `buildTimestamp` property."),
})
  .unknown()
  .required();

module.exports = { envVarsSchema };
