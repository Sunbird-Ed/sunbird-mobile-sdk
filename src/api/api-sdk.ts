import {ApiConfig} from "./config/api-config";
import {BaseConnection} from "./impl/base-connection";
import {BearerInterceptor} from "./impl/bearer-interceptor";
import {HttpClientImpl} from "./impl/http-client-impl";
import {Request} from "./def/request";
import {Response} from "./def/response";
import {SessionInterceptor} from "./impl/session-interceptor";
import {KEY_API_TOKEN} from "./def/constants";
import {FetchConfig} from "./config/fetch-config";

export class ApiSdk {

    private static apiConfig: ApiConfig;

    public static init(apiConfig: ApiConfig) {
        if (ApiSdk.apiConfig)
            return; //should be initialized only once
        ApiSdk.apiConfig = apiConfig;
    }

    /**
     * Initiate a http/https request with the base url provided during initialization.
     * @param request
     * @param config
     */
    public static async fetch(request: Request,
                              config: FetchConfig = {
                                  requiredApiToken: true,
                                  requiredSessionToken: false,
                                  responseInterceptors: []
                              }): Promise<Response> {

        function createConnection() {
            let httpClient = new HttpClientImpl();
            let baseConnection = new BaseConnection(httpClient, ApiSdk.apiConfig);
            return baseConnection;
        }

        let baseConnection = createConnection();


        function handleBearerToken() {
            if (config!!.requiredApiToken == true) {
                let bearerToken = localStorage.getItem(KEY_API_TOKEN);
                let existingHeaders = request.headers;
                existingHeaders["Authorization"] = "Bearer " + bearerToken;
                request.headers = existingHeaders;
                baseConnection.addResponseInterceptor(new BearerInterceptor(ApiSdk.apiConfig));
            }
        }

        function handleSessionToken() {
            if (config!!.requiredSessionToken == true) {
                baseConnection.addResponseInterceptor(new SessionInterceptor());
            }

        }


        function handleCustomInterceptors() {
            if (config!!.responseInterceptors!!.length > 0) {
                for (let interceptor of config!!.responseInterceptors!!) {
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