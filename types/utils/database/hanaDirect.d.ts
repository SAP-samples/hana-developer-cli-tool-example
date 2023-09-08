export default class _default extends DBClientClass {
    constructor(prompts: any);
    connect(): Promise<import("sap-hdb-promisfied").default>;
    listTables(): Promise<any>;
    execSQL(query: any): Promise<any>;
    #private;
}
import DBClientClass from "./index.js";
