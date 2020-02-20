import knex from "knex";
import config from "./config";
import logger from "./logger";

class DbConnector {
  private pool: knex;
  private idTableName = "id";
  private emailTableName = "email";

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

  public getDb = async () => {
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

  public healthCheck = async () => {
    const client = await this.getDb();
    const tablesToCheck = [config.userTable];
    const tablePromises = Promise.all(
      tablesToCheck.map(table => {
        const query = client
          .select()
          .from(table)
          .whereRaw("1=0");
        return this.executeQuery(query, `The table ${table} does not exist.`);
      }),
    );
    await tablePromises;
  };

  public insertUser = async (id, email) => {
    try {
      const client = await this.getDb();
      if (!(await client.schema.hasTable(config.userTable))) {
        await client.schema.createTable(config.userTable, table => {
          table
            .string(this.idTableName)
            .notNullable()
            .unique();
          table.string(this.emailTableName).notNullable();
        });
        logger.info(`Table '${config.userTable}' created.`);
      }
      logger.info(`Insert User '${id}' with email '${email}'`);
      await client(config.userTable).insert({
        [`${this.idTableName}`]: id,
        [`${this.emailTableName}`]: email,
      });
    } catch (error) {
      throw error;
    }
  };

  public updateUser = async (id, email) => {
    const client = await this.getDb();
    try {
      await client(config.userTable).update({
        [`${this.idTableName}`]: id,
        [`${this.emailTableName}`]: email,
      });
      logger.info(`Update User '${id}' with email '${email}'`);
    } catch (error) {
      throw error;
    }
  };

  public deleteUser = async (id, email) => {
    const client = await this.getDb();
    try {
      await client(config.userTable)
        .where({
          [`${this.idTableName}`]: id,
          [`${this.emailTableName}`]: email,
        })
        .del();
      logger.info(`Delete User '${id}' with email '${email}'`);
    } catch (error) {
      throw error;
    }
  };

  public getAllEmails = async () => {
    const client = await this.getDb();
    return (await client(config.userTable).select(this.emailTableName)).reduce(
      (emails, emailObject) => {
        emails.push(emailObject.email);
        return emails;
      },
      [],
    );
  };

  public getEmail = async (id: string): Promise<string> => {
    try {
      const client = await this.getDb();
      const emails = await client(config.userTable)
        .select(this.emailTableName)
        .where({ [`${this.idTableName}`]: `${id}` });
      if (emails.length > 0 && emails[0].email) {
        return emails[0].email;
      }
    } catch (error) {
      throw error;
    }
    logger.info(`No email found for ${id}`);
    return "";
  };

  private initializeConnection = () => {
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

  private createTable = async () => {
    await this.pool.schema.createTable(config.userTable, table => {
      table
        .string(this.idTableName)
        .notNullable()
        .unique();
      table.string(this.emailTableName).notNullable();
    });
    logger.info(`Table '${config.userTable}' created.`);
  };
}
export default DbConnector;
