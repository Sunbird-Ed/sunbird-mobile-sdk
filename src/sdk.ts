import {Sdk as DBSdk} from "./db";
import {Sdk as NetSdk} from "./net";
import {Sdk as TelemetrySdk} from "./telemetry";
import {SdkConfig} from "./sdk.config";

export class SunbirdSdk {

    private constructor() {
        //although private, what happens when it transpiles to javascript!!
        //hence throwing error...
        throw new Error("Should not be instantiated!!");
    }

    public static init(sdkConfig: SdkConfig) {
        NetSdk.init(sdkConfig.apiConfig);
        DBSdk.init(sdkConfig.dbContext);
        TelemetrySdk.init();
    }

}