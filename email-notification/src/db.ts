import knex from "knex";
import config from "./config";

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

  public getDb() {
    console.log("getDb");
    console.log(this.pool);
    if (!this.pool) {
      return this.initializeConnection();
    }
    return this.pool;
  }

  public disconnect = async () => {
    if (this.pool) {
      await this.pool.destroy();
    }
  };

  public healthCheck = async () => {
    const client = this.getDb();
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

  public cleanDb = async (client = this.getDb()) => {
    await client(config.userTable).truncate();
  };

  public insertUser = async (id, email) => {
    const client = this.getDb();
    try {
      if (!(await client.schema.hasTable(config.userTable))) {
        await client.schema.createTable(config.userTable, table => {
          table
            .string(this.idTableName)
            .notNullable()
            .unique();
          table.string(this.emailTableName).notNullable();
        });
        console.log(`INFO: Table '${config.userTable}' created.`);
      }
      console.log(`INFO: Insert User '${id}' with email '${email}'`);
      await client(config.userTable).insert({
        [`${this.idTableName}`]: id,
        [`${this.emailTableName}`]: email,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateUser = async (id, email) => {
    const client = this.getDb();
    try {
      if (!(await client.schema.hasTable(config.userTable))) {
        await client.schema.createTable(config.userTable, table => {
          table
            .string(this.idTableName)
            .notNullable()
            .unique();
          table.string(this.emailTableName).notNullable();
        });
        console.log(`INFO: Table '${config.userTable}' created.`);
      }
      console.log(`INFO: Update User '${id}' with email '${email}'`);
      await client(config.userTable).update({
        [`${this.idTableName}`]: id,
        [`${this.emailTableName}`]: email,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public deleteUser = async (id, email) => {
    const client = this.getDb();
    try {
      if (!(await client.schema.hasTable(config.userTable))) {
        await client.schema.createTable(config.userTable, table => {
          table
            .string(this.idTableName)
            .notNullable()
            .unique();
          table.string(this.emailTableName).notNullable();
        });
        console.log(`INFO: Table '${config.userTable}' created.`);
      }
      console.log(`INFO: Delete User '${id}' with email '${email}'`);
      await client(config.userTable)
        .where({
          [`${this.idTableName}`]: id,
          [`${this.emailTableName}`]: email,
        })
        .del();
    } catch (error) {
      console.log(error);
    }
  };

  public getAllEmails = async () => {
    const client = this.getDb();
    if (await !client.schema.hasTable(config.userTable)) {
      throw new Error(`Table '${config.userTable}' does not exist.`);
    }
    return (await this.pool(config.userTable).select(this.emailTableName)).reduce(
      (emails, emailObject) => {
        emails.push(emailObject.email);
        return emails;
      },
      [],
    );
  };

  public getEmail = async (id: string): Promise<string> => {
    try {
      console.log("CONFIG: ", config);
      const client = this.getDb();
      if (await !client.schema.hasTable(config.userTable)) {
        throw new Error(`Table '${config.userTable}' does not exist.`);
      }
      const emails = await this.pool(config.userTable)
        .select(this.emailTableName)
        .where({ [`${this.idTableName}`]: `${id}` });
      if (emails.length > 0 && emails[0].email) {
        return emails[0].email;
      }
    } catch (error) {
      console.log(error);
    }
    console.log(`INFO: No email found for ${id}`);
    return "";
  };

  private initializeConnection = () => {
    console.log("INFO: Initialize database connection");
    console.log(config);
    const knexConfig: knex.Config = {
      client: config.dbType,
      debug: config.sqlDebug,
      connection: config.db,
    };

    this.pool = knex(knexConfig);

    return this.pool;
  };

  // export const deleteUser = async (id, email) => {
  //   const client = getDb();
  //   if (!client.hasTable(config.userTable)) {
  //     throw new Error(`Table '${config.userTable}' does not exist.`);
  //   }
  //   client(config.userTable).insert({ id, email });
  // };
}

export default DbConnector;
