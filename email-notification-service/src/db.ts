import { Knex, knex } from "knex";
import config from "./config";
import logger from "./logger";

interface EmailAddress {
  email_address: string;
}

class DbConnector {
  private pool: Knex;

  private idTableName = "id";

  private emailAddressTableName = "email_address";

  public executeQuery = async (
    query: Knex.QueryBuilder,
    errorMessage = "Failed to execute database operation\n",
  ) => {
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
    if (!(await this.pool.schema.hasTable(config.userTable))) {
      logger.trace("No tables found - creating them now!");
      await this.createTable();
    }
    return this.pool;
  };

  public disconnect = async () => {
    if (this.pool) {
      await this.pool.destroy();
      logger.trace("Disconnected form DB");
    }
  };

  public healthCheck = async (): Promise<void> => {
    logger.debug("Starting health check");
    const client = await this.getDb();
    const tablesToCheck: string[] = [config.userTable];
    const tablePromises: Promise<Knex.QueryBuilder[]> = Promise.all(
      tablesToCheck.map((table) => {
        logger.trace({ table }, "Checking table");
        const query: Knex.QueryBuilder = client.select().from(table).whereRaw("1=0");
        return this.executeQuery(query, `The table ${table} does not exist.`);
      }),
    );
    await tablePromises;
  };

  public liveness = async () => {
    try {
      logger.debug("Starting to check database connection");
      await this.getDb();
    } catch (error) {
      logger.error({ error }, "Error in while checking database connection");
      return { status: 504, statusText: "Not ready. Waiting for Database" };
    }
    return { status: 200, statusText: "Ready" };
  };

  public insertUser = async (id: string, emailAddress: string): Promise<void> => {
    try {
      const client = await this.getDb();
      if (!(await client.schema.hasTable(config.userTable))) {
        await client.schema.createTable(config.userTable, (table) => {
          table.string(this.idTableName).notNullable().unique();
          table.string(this.emailAddressTableName).notNullable();
        });
        logger.info(`Table '${config.userTable}' created.`);
      }
      logger.info(`Insert User '${id}' with email address '${emailAddress}'`);
      await client(config.userTable).insert({
        [`${this.idTableName}`]: id,
        [`${this.emailAddressTableName}`]: emailAddress,
      });
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  public updateUser = async (id: string, emailAddress: string): Promise<void> => {
    const client = await this.getDb();
    try {
      await client(config.userTable)
        .update({
          [`${this.emailAddressTableName}`]: emailAddress,
        })
        .where({ [`${this.idTableName}`]: id });
      logger.info(`Update User '${id}' with email address '${emailAddress}'`);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  public deleteUser = async (id: string, emailAddress: string): Promise<void> => {
    const client = await this.getDb();
    try {
      await client(config.userTable)
        .where({
          [`${this.idTableName}`]: id,
          [`${this.emailAddressTableName}`]: emailAddress,
        })
        .del();
      logger.info(`Delete User '${id}' with email address '${emailAddress}'`);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  };

  public getAllEmails = async (): Promise<string[]> => {
    logger.trace("Getting all emails");
    const client = await this.getDb();
    return (await client(config.userTable).select(this.emailAddressTableName)).reduce(
      (emailAddresses: string[], emailAddress: EmailAddress) => {
        emailAddresses.push(emailAddress.email_address);
        return emailAddresses;
      },
      [],
    );
  };

  public getEmailAddress = async (id: string): Promise<string> => {
    try {
      const client = await this.getDb();
      logger.trace({ id }, "Getting email address from user by id");
      const emailAddresses: EmailAddress[] = await client(config.userTable)
        .select(this.emailAddressTableName)
        .where({ [`${this.idTableName}`]: `${id}` });
      if (emailAddresses.length > 0 && emailAddresses[0].email_address) {
        return emailAddresses[0].email_address;
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
    logger.debug(`No email address found for ${id}`);
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
    await this.pool.schema.createTable(config.userTable, (table) => {
      table.string(this.idTableName).notNullable().unique();
      table.string(this.emailAddressTableName).notNullable();
    });
    logger.info(`Table '${config.userTable}' created.`);
  };
}
export default DbConnector;
