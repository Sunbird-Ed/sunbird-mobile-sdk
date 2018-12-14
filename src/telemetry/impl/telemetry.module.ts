import { NgModule } from "@angular/core";
import { DBModule } from "../../db";
import { TelemetryService } from "..";
import { SunbirdTelemetryService } from "./service.impl";
import { TelemetryFactory } from "..";
import { SunbirdTelemetryFactory } from "./factory.impl";
import { TelemetryDecorator } from "..";
import { SunbirdTelemetryDecorator } from "./decorator.impl";

@NgModule({
    imports: [
        DBModule
    ],
    providers: [
        {provide: TelemetryService, useClass: SunbirdTelemetryService},
        {provide: TelemetryFactory, useClass: SunbirdTelemetryFactory},
        {provide: TelemetryDecorator, useClass: SunbirdTelemetryDecorator}
    ]
}
)
export class TelemetryModule {

}