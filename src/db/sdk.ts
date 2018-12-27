import {DbConfig} from "./def/db.config";
import {Service} from "./def/service";
import {ServiceImpl} from "./impl/service-impl";
import {InsertQuery, ReadQuery, UpdateQuery} from "./def/query";

export class Sdk {

    private static dbService: Service;

    private constructor() {
        //although private, what happens when it transpiles to javascript!!
        //hence throwing error...
        throw new Error("Should not be instantiated!!");
    }

    public static init(dbConfig: DbConfig) {
        if (Sdk.dbService == undefined) {
            Sdk.dbService = new ServiceImpl(dbConfig);
        }
    }

    public static getService(): Service {
        return Sdk.dbService;
    }

}