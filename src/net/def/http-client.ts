import {Response} from "./response";

export abstract class HttpClient {

    abstract addHeaders(headers: any);

    abstract addHeader(key: string, value: string);

    abstract get(baseUrl: string, path: string, headers: any, parameters: any): Promise<Response>

    abstract post(baseUrl: string, path: string, headers: any, body: any): Promise<Response>

    abstract patch(baseUrl: string, path: string, headers: any, body: any): Promise<Response>

}