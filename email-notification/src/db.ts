import knex from "knex";
import config from "./config";
import logger from "./logger";

interface EmailAddress {
  email_address: string;
}

class DbConnector {
  private pool: knex;
  private idTableName = "id";
  private emailAddressTableName = "email_address";

  public executeQuery = async (
    query: knex.QueryBuilder,
    errorMessage = "Failed to execute database operation\n",
  ) => {
    try {
      return query;
    } catch (error) {
      throw new Error(errorMessage + error);
    }
  };

  public getDb = async (): Promise<knex> => {
    if (!this.pool) {
      this.pool = this.initializeConnection();
    }
    if (!(await this.pool.schema.hasTable(config.userTable))) {
      await this.createTable();
    }
    return this.pool;
  };

  public disconnect = async () => {
    if (this.pool) {
      await this.pool.destroy();
    }
  };

  public healthCheck = async (): Promise<void> => {
    const client = await this.getDb();
    const tablesToCheck: string[] = [config.userTable];
    const tablePromises: Promise<string[]> = Promise.all(
      tablesToCheck.map(table => {
        const query: knex.QueryBuilder<any, any> = client
          .select()
          .from(table)
          .whereRaw("1=0");
        return this.executeQuery(query, `The table ${table} does not exist.`);
      }),
    );
    await tablePromises;
  };

  public insertUser = async (id: string, emailAddress: string): Promise<void> => {
    try {
      const client = await this.getDb();
      if (!(await client.schema.hasTable(config.userTable))) {
        await client.schema.createTable(config.userTable, table => {
          table
            .string(this.idTableName)
            .notNullable()
            .unique();
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
      throw error;
    }
  };

  public updateUser = async (id: string, emailAddress: string): Promise<void> => {
    const client = await this.getDb();
    try {
      await client(config.userTable).update({
        [`${this.idTableName}`]: id,
        [`${this.emailAddressTableName}`]: emailAddress,
      });
      logger.info(`Update User '${id}' with email address '${emailAddress}'`);
    } catch (error) {
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
      throw error;
    }
  };

  public getAllEmails = async (): Promise<string[]> => {
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
      const emailAddresses: EmailAddress[] = await client(config.userTable)
        .select(this.emailAddressTableName)
        .where({ [`${this.idTableName}`]: `${id}` });
      if (emailAddresses.length > 0 && emailAddresses[0].email_address) {
        return emailAddresses[0].email_address;
      }
    } catch (error) {
      throw error;
    }
    logger.debug(`No email address found for ${id}`);
    return "";
  };

  private initializeConnection = (): knex => {
    logger.info("Initialize database connection");
    logger.info(config);
    const knexConfig: knex.Config = {
      client: config.dbType,
      debug: config.sqlDebug,
      connection: config.db,
    };

    this.pool = knex(knexConfig);

    return this.pool;
  };

  private createTable = async (): Promise<void> => {
    await this.pool.schema.createTable(config.userTable, table => {
      table
        .string(this.idTableName)
        .notNullable()
        .unique();
      table.string(this.emailAddressTableName).notNullable();
    });
    logger.info(`Table '${config.userTable}' created.`);
  };
}
export default DbConnector;
