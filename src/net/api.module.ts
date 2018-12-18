import {ModuleWithProviders} from "@angular/core";
import {APIConfig} from "./config/api.config";
import {Connection} from "./def/connection";
import {SunbirdConnection} from "./impl/sunbird-connection";
import {SessionConnection} from "./def/session-connection";
import {SunbirdSessionConnection} from "./impl/sunbird-session-connection";
import {HttpClient} from "./def/http-client";
import {MobileHttpClient} from "./impl/mobile/mobile-http-client";
import {ResponseInterceptor} from "./def/response-interceptor";
import {UnauthorisedResponseInterceptor} from "./impl/mobile/interceptors/unauthorized-response-interceptor";
import {MobileAuthHandler} from './impl/mobile/mobile-auth-handler';

export class APIModule {

    static forRoot(config: APIConfig): ModuleWithProviders {
        return {
            ngModule: APIModule,
            providers: [
                {provide: APIConfig, useValue: config},
                {provide: HttpClient, useClass: MobileHttpClient},
                {provide: ResponseInterceptor, useClass: UnauthorisedResponseInterceptor},
                {provide: Connection, useClass: SunbirdConnection},
                {provide: MobileAuthHandler, useClass: MobileAuthHandler},
                {provide: SessionConnection, useClass: SunbirdSessionConnection}
            ]
        };
    }

}