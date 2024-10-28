import Mail = require("nodemailer/lib/mailer");
import { envVarsSchema } from "./envVarsSchema";

type DatabaseType = "pg" | "sqlite3" | "mysql" | "mysql2" | "oracledb" | "mssql";

interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  database: string;
  port: number;
  ssl: boolean;
  schema: string;
}
interface Config {
  authentication: string;
  http: { port: number };
  dbType: DatabaseType;
  db: DatabaseConfig;
  sqlDebug: boolean;
  userTable: string;
  smtpServer: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
  email: Mail.Options;
  allowOrigin: string;
  rateLimit: number | undefined;
  jwt: {
    secretOrPrivateKey: string;
    publicKey: string;
    algorithm: "HS256" | "RS256";
  };
}

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config: Config = {
  authentication: envVars.AUTHENTICATION?.toLowerCase(),
  http: {
    port: envVars.PORT,
  },
  dbType: envVars.DB_TYPE,
  db: {
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    host: envVars.DB_HOST,
    database: envVars.DB_NAME,
    port: envVars.DB_PORT,
    ssl: envVars.DB_SSL,
    schema: envVars.DB_SCHEMA,
  },
  sqlDebug: envVars.SQL_DEBUG,
  userTable: envVars.USER_TABLE,
  smtpServer: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    secure: envVars.SMTP_SSL,
    user: envVars.SMTP_USER,
    password: envVars.SMTP_PASSWORD,
  },
  email: {
    from: envVars.EMAIL_FROM,
    subject: envVars.EMAIL_SUBJECT,
    text: envVars.EMAIL_TEXT,
  },
  allowOrigin: envVars.ACCESS_CONTROL_ALLOW_ORIGIN,
  rateLimit: envVars.RATE_LIMIT,
  jwt: {
    secretOrPrivateKey: envVars.JWT_SECRET,
    publicKey: envVars.JWT_PUBLIC_KEY,
    algorithm: envVars.JWT_ALGORITHM,
  },
};

export default config;
