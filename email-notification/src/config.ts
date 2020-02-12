import Joi from "joi";

const envVarSchema = Joi.object({
  HTTP_PORT: Joi.number().default(8890),
  TCP_PORT: Joi.number().default(8889),
  DB_TYPE: Joi.string()
    .allow(["pg", "sqlite3", "mysql", "mysql2", "oracledb", "mssql"])
    .default("pg"),
  DB_USER: Joi.string().default("postgres"),
  DB_PASSWORD: Joi.string().default("test"),
  DB_HOST: Joi.string().default("localhost"),
  DB_NAME: Joi.string().default("trubudget_email_service"),
  DB_PORT: Joi.number().default(5432), // postgresql
  DB_SSL: Joi.boolean().default(false),
  DB_SCHEMA: Joi.string().default("public"),
  SQL_DEBUG: Joi.bool().default(false),
  USER_TABLE: Joi.string().default("users"),
  SMTP_HOST: Joi.string().default("localhost"),
  SMTP_PORT: Joi.number().default(2500),
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  tcp: {
    port: envVars.TCP_PORT,
  },
  http: {
    port: envVars.HTTP_PORT,
  },
  dbType: envVars.DB_TYPE,
  db: {
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    host: envVars.DB_HOST,
    database: envVars.DB_NAME,
    port: Number(envVars.DB_PORT),
    ssl: Boolean(envVars.DB_SSL),
    schema: envVars.DB_SCHEMA,
  },
  sqlDebug: Boolean(envVars.SQL_DEBUG),
  userTable: envVars.USER_TABLE,
  smtpServer: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
  },
};

export default config;
