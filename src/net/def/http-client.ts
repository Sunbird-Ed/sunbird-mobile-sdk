import {Response} from "./response";

export abstract class HttpClient {

    abstract withBaseUrl(baseUrl: string);

    abstract addHeaders(headers: any);

    abstract addHeader(key: string, value: string);

    abstract get(path: string, headers: any, parameters: any): Promise<Response>

    abstract post(path: string, headers: any, body: any): Promise<Response>

    abstract patch(path: string, headers: any, body: any): Promise<Response>

}