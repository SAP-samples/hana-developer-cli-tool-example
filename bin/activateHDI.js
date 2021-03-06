const base = require("../utils/base")

exports.command = 'activateHDI [tenant]';
exports.aliases = ['ahdi', 'ah'];
exports.describe = base.bundle.getText("activateHDI");

exports.builder = base.getBuilder({
  tenant: {
    alias: ['t', 'Tenant'],
    type: 'string',
    desc: base.bundle.getText("tenant")
  }
})

exports.handler = (argv) => {
  base.promptHandler(argv, activate, {
    tenant: {
      description: base.bundle.getText("tenant"),
      type: 'string',
      required: true
    }
  })
}

async function activate(prompts) {
  base.debug('activate')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()
    let results = await dbStatus.execSQL(
      `DO
      BEGIN
        DECLARE dbName NVARCHAR(25) = '${prompts.tenant}'; 
        -- Start diserver
        DECLARE diserverCount INT = 0;
        SELECT COUNT(*) INTO diserverCount FROM SYS_DATABASES.M_SERVICES WHERE SERVICE_NAME = 'diserver' AND DATABASE_NAME = :dbName AND ACTIVE_STATUS = 'YES';
        IF diserverCount = 0 THEN
          EXEC 'ALTER DATABASE ' || :dbName || ' ADD ''diserver''';
        END IF;           
      END;`)
    console.table(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}