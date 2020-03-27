const colors = require("colors/safe");   
const bundle = global.__bundle;
const dbClass = require("../utils/dbPromises");

exports.command = 'connect [user] [password]';
exports.aliases = ['c', 'login'];
exports.describe = bundle.getText("connect");

exports.builder = {
  connection: {
    alias: 'n',
    desc: bundle.getText("connection")
  },
  user: {
    alias: ['u', 'User'],
    desc: bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: bundle.getText("password")
  },  
  userstorekey: {
    alias: ['U', 'UserStoreKey'],
    desc: bundle.getText("userstorekey")
  },
  save: {
    alias: ['s', 'Save'],
    desc: bundle.getText("save"),
    type: 'boolean',
    default: true
  }, 
  encrypt: {
    alias: ['e', 'Encrypt', 'ssl'],
    desc: bundle.getText("encrypt"),
    type: 'boolean',
    default: false
  },
  trustStore: {
    alias: ['t', 'Trust', 'trust', 'truststore'],
    desc: bundle.getText("trustStore")
  }  
}

exports.handler = function (argv) {
  const prompt = require('prompt');
  prompt.override = argv;
  prompt.message = colors.green(bundle.getText("input"));
  prompt.start();

  var schema = {
    properties: {
      connection: {
        description: bundle.getText("connection"),
        pattern: /[^:]+:[0-9]+$/,
        message: bundle.getText("connErr"),
        required: true,
        ask: () =>{
            return !argv.userstorekey;
        }
      },
      user: {
        description: bundle.getText("user"),
        required: true,
        ask: () =>{
            return !argv.userstorekey;
        }
      },      
      password: {
        description: bundle.getText("password"),          
        hidden: true,
        replace: '*',
        required: true,
        ask: () =>{
            return !argv.userstorekey;
        }
      },
      save: {
        description: bundle.getText("save"),   
        type: 'boolean',       
        required: true
      },
      encrypt: {
        description: bundle.getText("encrypt"),   
        type: 'boolean',       
        required: true
      },      
      userstorekey: {
        description: bundle.getText("userstorekey"),          
        required: false,
        ask: () =>{
            return !argv.userstorekey && !argv.connection;
        }
      },
      trustStore: {
        description: bundle.getText("trustStore"),          
        required: false,
        ask: () =>{
            return !argv.trustStore;
        }
      }                    
    }
  };

   prompt.get(schema, (err, result) => {
       if(err){
           return console.log(err.message);
       }
       global.startSpinner()
       dbConnect(result);
  });
}

async function dbConnect(input) {
    try {
        let options = {};
        options.pooling = true;
        options.encrypt = input.encrypt;
        options.serverNode = input.userstorekey || input.connection;
        if (!input.userstorekey) { options.user = input.user }
        if (!input.userstorekey) { options.password = input.password }
        options.sslValidateCertificate = false
        options.validate_certificate = false
        if (input.trustStore) { 
          options.sslTrustStore = input.trustStore
          options.sslCryptoProvider = 'openssl'
          options.sslValidateCertificate = true
        }
        console.table(options);

        const db = new dbClass(await dbClass.createConnection(options));
        let results = await db.execSQL(`SELECT CURRENT_USER AS "Current User", CURRENT_SCHEMA AS "Current Schema" FROM DUMMY`);
        console.table(results);

        let resultsSession = await db.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`);
        console.table(resultsSession);

        if(input.save){
            saveEnv(options);
        }

    } catch (error) {
        throw new Error(`Connection Problem ${JSON.stringify(error)}`);
    }
}

async function saveEnv(options) {
        let parts = options.serverNode.split(':');
        let defaultEnv = {};        
        defaultEnv.VCAP_SERVICES = {};
        defaultEnv.VCAP_SERVICES.hana = [{
            name: "hana-cli",
            label: "hana",
            tags: [
                "hana",
                "database",
                "relational"
            ],
            plan: "hdi-shared",
            credentials: {
                password: options.password,
                port: parts[1],
                encrypt: options.encrypt,
                db_hosts: [
                    {
                        port: parts[1],
                        host: parts[0]
                    }
                ],
                host: parts[0],
                user: options.user }
        }];
        if (options.sslTrustStore) { 
          defaultEnv.VCAP_SERVICES.hana[0].credentials.sslTrustStore = options.sslTrustStore
          defaultEnv.VCAP_SERVICES.hana[0].credentials.sslCryptoProvider = 'openssl'
          defaultEnv.VCAP_SERVICES.hana[0].credentials.sslValidateCertificate = true
        }
        const fs = require('fs');
        fs.writeFile("default-env-admin.json", JSON.stringify(defaultEnv, null, '\t'), function (err) {
            if (err) {
                throw new Error(`Connection Problem ${JSON.stringify(err)}`);
            }
            console.log(bundle.getText("adminSaved"));
            global.__spinner.stop()
        }); 
}