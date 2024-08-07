import Mail = require("nodemailer/lib/mailer");

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

const config: Config = {
  authentication: process.env.AUTHENTICATION?.toLowerCase() || "jwt",
  http: {
    port: Number(process.env.PORT) || 8890,
  },
  dbType: process.env.DB_TYPE || "pg",
  db: {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "test",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "trubudget_email_service",
    port: Number(process.env.DB_PORT) || 5432,
    ssl: process.env.DB_SSL === "true",
    schema: process.env.DB_SCHEMA || "public",
  },
  sqlDebug: process.env.SQL_DEBUG === "true",
  userTable: process.env.USER_TABLE || "users",
  smtpServer: {
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 2500,
    secure: process.env.SMTP_SSL === "true",
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
  },
  email: {
    from: process.env.EMAIL_FROM || undefined,
    subject: process.env.EMAIL_SUBJECT || "Trubudget Notification",
    text: process.env.EMAIL_TEXT || "You have received a notification.",
  },
  allowOrigin: process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*",
  rateLimit:
    process.env.RATE_LIMIT === "" || isNaN(Number(process.env.RATE_LIMIT))
      ? undefined
      : Number(process.env.RATE_LIMIT),
  jwt: {
    secretOrPrivateKey: process.env.JWT_SECRET || "",
    publicKey: process.env.JWT_PUBLIC_KEY || "",
    algorithm: process.env.JWT_ALGORITHM === "RS256" ? "RS256" : "HS256",
  },
};

export default config;
