import {DbSdk} from "./db";
import {ApiSdk} from "./api";
import {TelemetrySdk} from "./telemetry";
import {SdkConfig} from "./sdk.config";

export class SunbirdSdk {

    private constructor() {
        //although private, what happens when it transpiles to javascript!!
        //hence throwing error...
        throw new Error("Should not be instantiated!!");
    }

    public static init(sdkConfig: SdkConfig) {
        ApiSdk.init(sdkConfig.apiConfig);
        DbSdk.init(sdkConfig.dbContext);
        TelemetrySdk.init();
    }

}