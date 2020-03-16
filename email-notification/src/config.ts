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
  mode: string;
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
}

const config: Config = {
  mode: process.env.MODE || "DEBUG",
  http: {
    port: Number(process.env.HTTP_PORT) || 8890,
  },
  dbType: process.env.DB_TYPE || "pg",
  db: {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "test",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "trubudget_email_service",
    port: Number(process.env.DB_PORT) || 5432,
    ssl: Boolean(process.env.DB_SSL) || false,
    schema: process.env.DB_SCHEMA || "public",
  },
  sqlDebug: Boolean(process.env.SQL_DEBUG) || false,
  userTable: process.env.USER_TABLE || "users",
  smtpServer: {
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 2500,
    secure: Boolean(process.env.SMTP_SSL) || false,
    user: process.env.SMTP_USER || "testuser",
    password: process.env.SMTP_USER || "test",
  },
  email: {
    from:
      process.env.EMAIL_FROM || '"Trubudget Notification Service👻" <trubudget@notification.com>',
    subject: process.env.EMAIL_SUBJECT || "Trubudget Notificaiton",
    text: process.env.EMAIL_TEXT || "You have received a notification.",
  },
};

export default config;
