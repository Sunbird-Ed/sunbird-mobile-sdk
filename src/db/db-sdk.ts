import {DbConfig} from "./def/db.config";
import {Service} from "./def/service";
import {ServiceImpl} from "./impl/service-impl";
import {InsertQuery, ReadQuery, UpdateQuery} from "./def/query";

export class DbSdk {

    private static dbService: Service;

    private constructor() {
        //although private, what happens when it transpiles to javascript!!
        //hence throwing error...
        throw new Error("Should not be instantiated!!");
    }

    public static init(dbConfig: DbConfig) {
        if (DbSdk.dbService == undefined) {
            DbSdk.dbService = new ServiceImpl(dbConfig);
        }
    }

    public static getService(): Service {
        return DbSdk.dbService;
    }

}