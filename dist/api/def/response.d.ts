export declare enum ResponseCode {
    HTTP_UNAUTHORISED = 401,
    HTTP_SUCCESS = 200,
    SUCCESS_GENERIC = 2000,
    ERROR_GENERIC = 1000,
    ERROR_DB = 1001,
    ERROR_IO = 1002
}
export declare class Response<T = any> {
    private _responseCode;
    private _errorMesg;
    private _body;
    responseCode: ResponseCode;
    errorMesg: string;
    body: T;
}
