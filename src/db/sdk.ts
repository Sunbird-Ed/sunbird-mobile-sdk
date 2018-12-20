import {Context} from "./def/context";
import {Service} from "./def/service";
import {ServiceImpl} from "./impl/service-impl";

export class Sdk {

    private static dbService: Service;

    private constructor() {
        //although private, what happens when it transpiles to javascript!!
        //hence throwing error...
        throw new Error("Should not be instantiated!!");
    }

    public static init(dbContext: Context) {
        if (Sdk.dbService == undefined) {
            Sdk.dbService = new ServiceImpl(dbContext);
        }
    }

    public static getService(): Service {
        if (Sdk.dbService == undefined) {
            throw new Error("db is not initialized yet!! Call DbSdk.init() with valid db context.");
        }
        return Sdk.dbService;
    }


}