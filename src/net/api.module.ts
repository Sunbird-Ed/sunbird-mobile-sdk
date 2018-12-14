import {ModuleWithProviders, NgModule} from "@angular/core";
import {APIConfig} from "./config/api.config";
import {APIConnection} from "./def/api.conn";
import {SunbirdAPIConnection} from "./impl/sunbird.api.conn";
import {SessionAPIConnection} from "./def/api.session.conn";
import {SunbirdSessionApiConnection} from "./impl/sunbird.session.api.conn";
import {HttpClient} from "./def/http.client";
import {MobileHttpClient} from "./impl/mobile.http";
import {APIResponseInterceptor} from "./def/api.interceptor";
import {SunbirdResponseInterceptor} from "./impl/sunbird.interceptor";

export class APIModule {

    static forRoot(config: APIConfig): ModuleWithProviders {
        return {
            ngModule: APIModule,
            providers: [
                {provide: HttpClient, useValue: MobileHttpClient},
                {provide: APIResponseInterceptor, useValue: SunbirdResponseInterceptor},
                {provide: APIConnection, useValue: config, useClass: SunbirdAPIConnection},
                {provide: SessionAPIConnection, useValue: config, useClass: SunbirdSessionApiConnection}
            ]
        };
    }

}