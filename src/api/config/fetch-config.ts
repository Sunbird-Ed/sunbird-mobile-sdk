import {ResponseInterceptor} from "..";

export type FetchConfig = {
    requiredApiToken: boolean,
    requiredSessionToken?: boolean,
    responseInterceptors?: Array<ResponseInterceptor>
}