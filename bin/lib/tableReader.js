const dbClass = require('sap-hdbext-promisfied');

module.exports = class {
  static async getTables({ schema, table = '*', limit, admin }) {
    const db = new dbClass(
      await dbClass.createConnectionFromEnv(dbClass.resolveEnv({ admin }))
    );

    schema = await dbClass.schemaCalc({ schema }, db);
    console.log(`Schema: ${schema}, Table: ${table}`);

    return getTablesInt(schema, table, db, limit);
  }
};

async function getTablesInt(schema, table, client, limit) {
  table = dbClass.objectName(table);

  var query = `SELECT SCHEMA_NAME, TABLE_NAME, TO_NVARCHAR(TABLE_OID) AS TABLE_OID, COMMENTS  from TABLES 
    WHERE SCHEMA_NAME LIKE ? 
      AND TABLE_NAME LIKE ? 
    ORDER BY SCHEMA_NAME, TABLE_NAME `;
  if (
    (limit !== null) |
    require('@sap/hdbext').sqlInjectionUtils.isAcceptableParameter(limit)
  ) {
    query += `LIMIT ${limit.toString()}`;
  }
  return await client.statementExecPromisified(
    await client.preparePromisified(query),
    [schema, table]
  );
}
