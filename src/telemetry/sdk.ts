import {TelemetryService} from "./def/telemetry.service";
import {TelemetryServiceImpl} from "./impl/service.impl";
import {TelemetryDecoratorImpl} from "./impl/decorator.impl";

export class Sdk {

    private static telemetryService: TelemetryService;

    private constructor() {
        //although private, what happens when it transpiles to javascript!!
        //hence throwing error...
        throw new Error("Should not be instantiated!!");
    }

    public static init() {
        if (Sdk.telemetryService == undefined) {
            let decorator = new TelemetryDecoratorImpl();
            Sdk.telemetryService = new TelemetryServiceImpl(decorator);
        }
    }

    public static getService(): TelemetryService {
        return Sdk.telemetryService;
    }

}