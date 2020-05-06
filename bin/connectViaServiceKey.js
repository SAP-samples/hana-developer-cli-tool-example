const colors = require("colors/safe");
const bundle = global.__bundle;
const dbClass = require("sap-hdbext-promisfied");

exports.command = 'serviceKey [instance] [key]';
exports.aliases = ['key', 'servicekey', 'service-key'];
exports.describe = bundle.getText("serviceKey");

exports.builder = {
  instance: {
    alias: ['i', 'Instance'],
    desc: bundle.getText("instance")
  },
  key: {
    alias: ['k', 'key'],
    desc: bundle.getText("key")
  },
  encrypt: {
    alias: ['e', 'Encrypt', 'ssl'],
    desc: bundle.getText("encrypt"),
    type: 'boolean',
    default: false
  },
  validate: {
    alias: ['v', 'Validate', 'validateCertificate'],
    desc: bundle.getText("validate"),
    type: 'boolean',
    default: false
  },
  cf: {
    alias: ['cmd'],
    desc: bundle.getText("cfxs"),
    type: 'boolean',
    default: false
  },
  save: {
    alias: ['s', 'Save'],
    desc: bundle.getText("save2"),
    type: 'boolean',
    default: true
  }
}

exports.handler = function (argv) {
  const prompt = require('prompt');
  prompt.override = argv;
  prompt.message = colors.green(bundle.getText("input"));
  prompt.start();

  var schema = {
    properties: {
      instance: {
        description: bundle.getText("connection"),
        message: bundle.getText("instance"),
        required: true
      },
      key: {
        description: bundle.getText("key"),
        required: true
      },
      encrypt: {
        description: bundle.getText("encrypt"),
        type: 'boolean',
        default: true,
        required: false
      },
      validate: {
        description: bundle.getText("validate"),
        type: 'boolean',
        default: false,
        required: false
      },
      cf: {
        description: bundle.getText("cfxs"),
        type: 'boolean',
        default: true,
        required: false
      },
      save: {
        description: bundle.getText("save2"),
        type: 'boolean',
        required: true
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    setKeyDetails(result);
  });
}

async function setKeyDetails(input) {
  try {
    var child = require("child_process").exec
    var script = ''
    if(input.cf){
      script = `cf service-key ${input.instance} ${input.key}`
    }else{
      script = `xs service-key ${input.instance} ${input.key}`
    }
    child(script, (err, stdout) => {
      if (err) {
        console.error(`ERROR: ${err.toString()}`)
        console.log(stdout)
        global.__spinner.stop()
        return
      } else {
        let lines = stdout.split('\n');
        console.log(lines[0])
        lines.splice(0, 2)
        if(!input.cf){
          lines.splice(-3, 3);
        }
        let newtext = lines.join('\n');        
        let returnContent = JSON.parse(newtext)
 
        if (input.save) {
          saveEnv(returnContent, input)
        }
      }
    })
    
  } catch (error) {
    throw new Error(`Connection Problem ${JSON.stringify(error)}`);
  }
}

async function saveEnv(options, input) {
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
    credentials: options
  }];

  defaultEnv.VCAP_SERVICES.hana[0].credentials.encrypt = input.encrypt
  defaultEnv.VCAP_SERVICES.hana[0].credentials.sslCryptoProvider = 'openssl'
  if (input.validate) {
    defaultEnv.VCAP_SERVICES.hana[0].credentials.sslValidateCertificate = true
  } else {
    defaultEnv.VCAP_SERVICES.hana[0].credentials.sslValidateCertificate = false
    delete defaultEnv.VCAP_SERVICES.hana[0].credentials.certificate
  }

  const db = new dbClass(await dbClass.createConnection(options));
  let results = await db.execSQL(`SELECT CURRENT_USER AS "Current User", CURRENT_SCHEMA AS "Current Schema" FROM DUMMY`);
  console.table(results);

  let resultsSession = await db.execSQL(`SELECT * FROM M_SESSION_CONTEXT WHERE CONNECTION_ID = (SELECT SESSION_CONTEXT('CONN_ID') FROM "DUMMY")`);
  console.table(resultsSession);

  if (input.save) {
    const fs = require('fs');
    fs.writeFile("default-env.json", JSON.stringify(defaultEnv, null, '\t'), function (err) {
      if (err) {
        throw new Error(`Connection Problem ${JSON.stringify(err)}`);
      }
      console.log(bundle.getText("saved"));

    });
  }
  global.__spinner.stop()
}