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
  http: { port: number };
  dbType: DatabaseType;
  db: DatabaseConfig;
  sqlDebug: boolean;
  userTable: string;
  smtpServer: {
    host: string;
    port: number;
  };
}

const config: Config = {
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
  },
};

export default config;
