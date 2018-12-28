import {TelemetryService} from "./def/telemetry.service";
import {TelemetryServiceImpl} from "./impl/service.impl";
import {TelemetryDecoratorImpl} from "./impl/decorator.impl";

export class TelemetrySdk {

    private static telemetryService: TelemetryService;

    private constructor() {
        //although private, what happens when it transpiles to javascript!!
        //hence throwing error...
        throw new Error("Should not be instantiated!!");
    }

    public static init() {
        if (TelemetrySdk.telemetryService == undefined) {
            let decorator = new TelemetryDecoratorImpl();
            TelemetrySdk.telemetryService = new TelemetryServiceImpl(decorator);
        }
    }

    public static getService(): TelemetryService {
        return TelemetrySdk.telemetryService;
    }

}