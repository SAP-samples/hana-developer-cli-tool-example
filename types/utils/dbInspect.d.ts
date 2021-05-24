export namespace options { }
export function getHANAVersion(db: any): Promise<any>;
export function getView(db: any, scheam: any, viewId: any): Promise<any>;
export function getDef(db: any, schema: any, Id: any): Promise<any>;
export function getViewFields(db: any, viewOid: any): Promise<any>;
export function getTable(db: any, schema: any, tableId: any): Promise<any>;
export function getTableFields(db: any, tableOid: any): Promise<any>;
export function getConstraints(db: any, object: any): Promise<any>;
export function getProcedure(db: any, schema: any, procedure: any): Promise<any>;
export function getProcedurePrams(db: any, procOid: any): Promise<any>;
export function getProcedurePramCols(db: any, procOid: any): Promise<any>;
export function getFunction(db: any, schema: any, functionName: any): Promise<any>;
export function getFunctionPrams(db: any, funcOid: any): Promise<any>;
export function getFunctionPramCols(db: any, funcOid: any): Promise<any>;
export function formatCDS(db: any, object: any, fields: any, constraints: any, type: any, parent: any): Promise<string>;
export function getGeoColumns(db: any, object: any, field: any, type: any): Promise<any>;
