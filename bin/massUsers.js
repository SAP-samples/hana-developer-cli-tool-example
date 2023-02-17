// @ts-check
import * as base from '../utils/base.js'

export const command = 'massUsers [user] [password]'
export const aliases = ['massUser', 'mUsers', 'mUser', 'mu']
export const describe = base.bundle.getText("massUsers")

export const builder = base.getBuilder({
  user: {
    alias: ['u', 'User'],
    desc: base.bundle.getText("user")
  },
  password: {
    alias: ['p', 'Password'],
    desc: base.bundle.getText("password")
  }
})

export function handler (argv) {
  base.promptHandler(argv, massUsers, {
    user: {
      description: base.bundle.getText("user"),
      required: true
    },
    password: {
      description: base.bundle.getText("password"),
      hidden: true,
      replace: '*',
      required: true
    }
  })
}


export async function massUsers(prompts) {
  base.debug('massUsers')
  try {
    base.setPrompts(prompts)
    const dbStatus = await base.createDBConnection()

    let results = await dbStatus.execSQL(
      `DO
    begin
      declare lv_counter integer := 0; 
      declare lv_user varchar(30) := null;
      declare IM_PREFIX varchar(30) := '${prompts.user}_';
      declare IM_PASSWORD VARCHAR(30) := '${prompts.password}'; 
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
    `)
    base.outputTableFancy(results)
    return base.end()
  } catch (error) {
    base.error(error)
  }
}