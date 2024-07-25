import { Knex, knex } from "knex";
import { config } from "../config";
import logger from "./logger";

interface RefreshTokenEntry {
  user_id: string;
  refresh_token: string;
  valid_until: string;
}

class DbConnector {
  private pool: Knex;

  private userIdColumnName = "user_id";
  private refreshTokenColumnName = "refresh_token";
  private validityColumnName = "valid_until";

  public executeQuery = async (
    query: Knex.QueryBuilder,
    errorMessage = "Failed to execute database operation\n",
  ): Promise<void> => {
    try {
      return await query;
    } catch (error) {
      throw new Error(errorMessage + error);
    }
  };

  public getDb = async (): Promise<Knex> => {
    if (!this.pool) {
      logger.trace("Initializing DB connection(s) ...");
      this.pool = this.initializeConnection();
    }
    if (!config.refreshTokensTable) {
      throw new Error("refreshTokensTable ENV variable not set.");
    }
    if (!(await this.pool.schema.hasTable(config.refreshTokensTable))) {
      logger.trace("No tables found - creating them now!");
      await this.createTable();
    }
    return this.pool;
  };

  public disconnect = async (): Promise<void> => {
    if (this.pool) {
      await this.pool.destroy();
      logger.trace("Disconnected form DB");
    }
  };

  public healthCheck = async (): Promise<void> => {
    logger.debug("Starting health check");
    const client = await this.getDb();
    if (!config.refreshTokensTable) {
      throw new Error("refreshTokensTable ENV variable not set in healthCheck.");
    }
    const tablesToCheck: string[] = [config.refreshTokensTable];
    const tablePromises = Promise.all(
      tablesToCheck.map((table) => {
        logger.trace({ table }, "Checking table");
        const query: Knex.QueryBuilder = client.select().from(table).whereRaw("1=0");
        return this.executeQuery(query, `The table ${table} does not exist.`);
      }),
    );
    await tablePromises;
  };

  public liveness = async (): Promise<{ status: number; statusText: string }> => {
    try {
      logger.debug("Starting to check database connection");
      await this.getDb();
    } catch (error) {
      logger.error({ error }, "Error in while checking database connection");
      return { status: 504, statusText: "Not ready. Waiting for Database" };
    }
    return { status: 200, statusText: "Ready" };
  };

  public insertRefreshToken = async (
    userId: string,
    refreshToken: string,
    validUntil: number,
  ): Promise<void> => {
    const client = await this.getDb();
    try {
      await client(config.refreshTokensTable).insert({
        [`${this.userIdColumnName}`]: userId,
        [`${this.refreshTokenColumnName}`]: refreshToken,
        [`${this.validityColumnName}`]: validUntil,
      });
      logger.info(`Insert refresh token for user '${userId}' valid until '${validUntil}'`);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  public deleteRefreshToken = async (refreshToken: string): Promise<void> => {
    const client = await this.getDb();
    try {
      await client(config.refreshTokensTable)
        .where({
          [`${this.refreshTokenColumnName}`]: refreshToken,
        })
        .del();
      logger.info(`Delete refresh token '${refreshToken}' succesfull`);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  public getRefreshToken = async (
    refreshToken: string,
  ): Promise<{ userId: string; validUntil: number } | undefined> => {
    try {
      const client = await this.getDb();
      logger.trace({ refreshToken }, "Getting refresh token from user by id");
      const refreshTokenLines: RefreshTokenEntry[] = await client(config.refreshTokensTable)
        .select([this.validityColumnName, this.refreshTokenColumnName, this.userIdColumnName])
        .where({ [`${this.refreshTokenColumnName}`]: `${refreshToken}` });
      if (refreshTokenLines.length > 0 && refreshTokenLines[0][this.validityColumnName]) {
        return {
          userId: refreshTokenLines[0][this.userIdColumnName],
          validUntil: refreshTokenLines[0][this.validityColumnName],
        };
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
    logger.debug(`No refresh token found for user ${refreshToken}`);
  };

  private initializeConnection = (): Knex => {
    logger.info("Initialize database connection");
    logger.info(config);
    const knexConfig: Knex.Config = {
      client: config.dbType,
      debug: config.sqlDebug,
      connection: config.db,
    };

    this.pool = knex(knexConfig);

    return this.pool;
  };

  private createTable = async (): Promise<void> => {
    logger.debug("Creating refresh tokens table");
    await this.pool.schema.createTable(config.refreshTokensTable as string, (table) => {
      table.string(this.userIdColumnName, 200).notNullable();
      table.string(this.refreshTokenColumnName).notNullable().unique();
      table.bigInteger(this.validityColumnName);
    });
    logger.info(`Table '${config.refreshTokensTable}' created.`);
  };
}
export default DbConnector;
