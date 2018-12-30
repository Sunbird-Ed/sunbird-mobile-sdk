import {ApiConfig} from "./config/api-config";
import {Request} from "./def/request";
import {Response} from "./def/response";
import {FetchConfig} from "./config/fetch-config";
import {FetchHandler} from './impl/handlers/fetch-handler';
import {OauthHandler} from './impl/handlers/oauth-handler';

export class ApiSdk {

    private static readonly _instance?: ApiSdk;
    private apiConfig?: ApiConfig;

    public static get instance(): ApiSdk {
        if (!ApiSdk._instance) {
            return new ApiSdk();
        }

        return ApiSdk._instance;
    }

    /**
     * Instantiate SDK
     * @param apiConfig - provide configuration
     */
    public init(apiConfig: ApiConfig) {
        this.apiConfig = apiConfig;
    }

    /**
     * Invoke an http/https request
     * @param request
     * @param fetchConfig - provide fetch configuration
     */
    public async fetch(request: Request, fetchConfig: FetchConfig = {
                                  requiredApiToken: true,
                                  requiredSessionToken: false,
                                  responseInterceptors: []
                              }): Promise<Response> {
        return new FetchHandler(request, this.apiConfig!, fetchConfig).doFetch();
    }

    public async login() {
        const oauthHandler = new OauthHandler(this.apiConfig!);
        return oauthHandler.doLogin();
    }

    public async logout() {
        const oauthHandler = new OauthHandler(this.apiConfig!);
        return oauthHandler.doLogout();
    }
}