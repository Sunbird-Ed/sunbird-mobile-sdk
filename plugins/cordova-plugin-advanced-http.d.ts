// @ts-ignore
interface HttpResponse {
    status: number;
    headers: any;
    url: string;
    data?: any;
}
interface HttpOptions {
    url: string	
    method?: string	
    params?:HttpParams
    data?:	any	 
    headers?:	HttpHeaders
    readTimeout?:	number	
    connectTimeout?:	number	
    disableRedirects?:	boolean	
    webFetchExtra?:	RequestInit	
    responseType?:	HttpResponseType
    shouldEncodeUrlParams?:	boolean
}
interface Capacitor {
    Plugins: {
        http: {
            request: (HttpOptions) => Promise<HttpResponse>
            get: (HttpOptions) => Promise<HttpResponse>
            post: (HttpOptions) => Promise<HttpResponse>
            put: (HttpOptions) => Promise<HttpResponse>
            patch: (HttpOptions) => Promise<HttpResponse>
            delete: (HttpOptions) => Promise<HttpResponse>
        }
    }
}
interface Cordova {
    plugin: {
        http: {
            setDataSerializer: (string) => void;
            setHeader: (host: string, header: string, value: string) => void;
            get: (url: string, parameters: any, headers: { [key: string]: string },
                  successCallback: (response: HttpResponse) => void,
                  errorCallback: (response: HttpResponse) => void) => void;
            patch: (url: string, data: any, headers: { [key: string]: string },
                    successCallback: (response: HttpResponse) => void,
                    errorCallback: (response: HttpResponse) => void) => void;
            post: (url: string, data: any, headers: { [key: string]: string },
                   successCallback: (response: HttpResponse) => void,
                   errorCallback: (response: HttpResponse) => void) => void;
        }
    };
}
