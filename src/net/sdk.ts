import {ApiConfig} from "./config/api-config";
import {BaseConnection} from "./impl/base-connection";
import {BearerInterceptor} from "./impl/bearer-interceptor";
import {HttpClientImpl} from "./impl/http-client-impl";
import {Request} from "./def/request";
import {Response} from "./def/response";
import {SessionInterceptor} from "./impl/session-interceptor";
import {ResponseInterceptor} from "./def/response-interceptor";
import {KEY_API_TOKEN} from "./def/constants";

export class Sdk {

    private static apiConfig: ApiConfig;

    public static init(apiConfig: ApiConfig) {
        if (Sdk.apiConfig)
            return; //should be initialized only once
        Sdk.apiConfig = apiConfig;
    }

    public static async fetch(request: Request,
                              requiredApiToken: boolean = true,
                              requiredSessionToken?: boolean,
                              responseInterceptors?: Array<ResponseInterceptor>): Promise<Response> {
        function createConnection() {
            let httpClient = new HttpClientImpl();
            let baseConnection = new BaseConnection(httpClient, Sdk.apiConfig);
            return baseConnection;
        }

        let baseConnection = createConnection();


        function handleBearerToken() {
            if (requiredApiToken == true) {
                let bearerToken = localStorage.getItem(KEY_API_TOKEN);
                let existingHeaders = request.headers;
                existingHeaders["Authorization"] = "Bearer " + bearerToken;
                request.headers = existingHeaders;
                baseConnection.addResponseInterceptor(new BearerInterceptor(Sdk.apiConfig));
            }
        }

        function handleSessionToken() {
            if (requiredSessionToken && requiredSessionToken == true) {
                baseConnection.addResponseInterceptor(new SessionInterceptor());
            }

        }


        function handleCustomInterceptors() {
            if (responseInterceptors && responseInterceptors.length > 0) {
                for (let interceptor of responseInterceptors) {
                    baseConnection.addResponseInterceptor(interceptor);
                }
            }

        }

        handleBearerToken();
        handleSessionToken();
        handleCustomInterceptors();



        return await baseConnection.invoke(request);
    }

}