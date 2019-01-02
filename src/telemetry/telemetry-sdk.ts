import {TelemetryService} from "./def/telemetry.service";
import {TelemetryServiceImpl} from "./impl/service-impl";
import {TelemetryDecoratorImpl} from "./impl/decorator.impl";
import {Service} from '../db';

export class TelemetrySdk {

    private static telemetryService: TelemetryService;

    private static readonly _instance?: TelemetrySdk;
    private static dbService: Service;

    public static get instance(): TelemetrySdk {
        if (!TelemetrySdk._instance) {
            return new TelemetrySdk();
        }

        return TelemetrySdk._instance;
    }

    public init() {
        if (TelemetrySdk.telemetryService == undefined) {
            let decorator = new TelemetryDecoratorImpl();
            TelemetrySdk.telemetryService = new TelemetryServiceImpl(decorator);
        }
    }

    public getService(): TelemetryService {
        return TelemetrySdk.telemetryService;
    }

}