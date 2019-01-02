import {DbConfig} from "./config/db-config";
import {Service} from "./def/service";
import {ServiceImpl} from "./impl/service-impl";

export class DbSdk {

    private static readonly _instance?: DbSdk;
    private static dbService: Service;

    public static get instance(): DbSdk {
        if (!DbSdk._instance) {
            return new DbSdk();
        }

        return DbSdk._instance;
    }

    public init(dbConfig: DbConfig) {
        if (DbSdk.dbService == undefined) {
            DbSdk.dbService = new ServiceImpl(dbConfig);
        }
    }

    public getService(): Service {
        return DbSdk.dbService;
    }

}