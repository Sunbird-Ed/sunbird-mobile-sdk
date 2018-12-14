
export abstract class HttpClient<T> {

    abstract withBaseUrl(baseUrl: string);

    abstract addHeaders(headers: any);

    abstract addHeader(key: string, value: string);

    abstract get(path: string, headers: any, parameters: any): Promise<T>

    abstract post(path: string, headers: any, body: string): Promise<T>

    abstract patch(path: string, headers: any, body: string): Promise<T>

}