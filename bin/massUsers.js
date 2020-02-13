const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'massUsers [user] [password]';
exports.aliases = ['massUser', 'mUsers', 'mUser', 'mu'];
exports.describe = bundle.getText("massUsers");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: true,
    desc: bundle.getText("admin")
  },
  user: {
    alias: ['u', 'User'],
    desc: bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: bundle.getText("password")
  },
};

exports.handler = function (argv) {
  const prompt = require('prompt');
  prompt.override = argv;
  prompt.message = colors.green(bundle.getText("input"));
  prompt.start();

  var schema = {
    properties: {
      admin: {
        description: bundle.getText("admin"),
        type: 'boolean',
        required: true,
        ask: () => {
          return false;
        }
      },
      user: {
        description: bundle.getText("user"),
        required: true
      },
      password: {
        description: bundle.getText("password"),
        hidden: true,
        replace: '*',
        required: true
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    activate(result);
  });
}


async function activate(result) {
  const dbStatus = new dbClass(await dbClass.createConnectionFromEnv(dbClass.resolveEnv(result)));

  let results = await dbStatus.execSQL(
    `DO
    begin
      declare lv_counter integer := 0; 
      declare lv_user varchar(30) := null;
      declare IM_PREFIX varchar(30) := '${result.user}_';
      declare IM_PASSWORD VARCHAR(30) := '${result.password}'; 
    WHILE :lv_counter < 50 DO 
    
       lv_counter := :lv_counter + 1;
    
           lv_user := :im_prefix || LPAD(:lv_counter, 2, '0'); 
    
    
       EXEC 'CREATE USER ' || :lv_user || ' PASSWORD ' || :im_password  || ' SET PARAMETER CLIENT = ''001'''; 
       EXEC 'ALTER USER ' || :lv_user || ' SET PARAMETER EMAIL ADDRESS = ''' || :lv_user || '@sap.com''';
       EXEC 'ALTER USER ' || :lv_user || ' DISABLE PASSWORD LIFETIME';
       EXEC 'ALTER USER ' || :lv_user || ' SET PARAMETER XS_RC_XS_CONTROLLER_USER = ''XS_CONTROLLER_USER''';
       EXEC 'ALTER USER ' || :lv_user || ' SET PARAMETER XS_RC_XS_USER_PUBLIC = ''XS_USER_PUBLIC''';  
       EXEC 'ALTER USER ' || :lv_user || ' SET PARAMETER XS_RC_WEBIDE_USER = ''WEBIDE_USER'''; 
      
      END WHILE;
      end;    
    `);
  console.table(results);
  global.__spinner.stop()
  return;
}