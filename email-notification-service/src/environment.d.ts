declare namespace NodeJS {
  export interface ProcessEnv {
    DB_TYPE: "pg" | "sqlite3" | "mysql" | "mysql2" | "oracledb" | "mssql";
  }
}
