import { Knex, knex } from "knex";
import configFunction from "../config";
import logger from "./logger";

const config = configFunction();

interface EmailAddress {
  email_address: string;
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
    if (!(await this.pool.schema.hasTable(config.refreshTokensTable as string))) {
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
    const tablesToCheck: string[] = [config.refreshTokensTable as string];
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

  public upsetRefreshToken = async (
    userId: string,
    refreshToken: string,
    validUntil: string,
  ): Promise<void> => {
    const client = await this.getDb();
    try {
      await client(config.refreshTokensTable)
        .insert({
          [`${this.userIdColumnName}`]: userId,
          [`${this.refreshTokenColumnName}`]: refreshToken,
          [`${this.validityColumnName}`]: validUntil,
        })
        .onConflict(this.userIdColumnName)
        .merge();
      logger.info(`Upsert refresh token for user '${userId}' valid until '${validUntil}'`);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  public deleteRefreshToken = async (userId: string): Promise<void> => {
    const client = await this.getDb();
    try {
      await client(config.refreshTokensTable)
        .where({
          [`${this.userIdColumnName}`]: userId,
        })
        .del();
      logger.info(`Delete refresh token for user '${userId}'`);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  public getRefreshToken = async (userId: string): Promise<string> => {
    try {
      const client = await this.getDb();
      logger.trace({ userId }, "Getting refresh token from user by id");
      const emailAddresses: EmailAddress[] = await client(config.refreshTokensTable)
        .select(this.refreshTokenColumnName)
        .where({ [`${this.userIdColumnName}`]: `${userId}` });
      if (emailAddresses.length > 0 && emailAddresses[0].email_address) {
        return emailAddresses[0].email_address;
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
    logger.debug(`No refresh token found for user ${userId}`);
    return "";
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
    logger.debug("Creating user table");
    await this.pool.schema.createTable(config.refreshTokensTable as string, (table) => {
      table.string(this.userIdColumnName).notNullable().unique();
      table.string(this.refreshTokenColumnName).notNullable();
    });
    logger.info(`Table '${config.refreshTokensTable}' created.`);
  };
}
export default DbConnector;
