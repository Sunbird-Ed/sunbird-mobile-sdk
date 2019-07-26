export declare enum ResponseCode {
    HTTP_UNAUTHORISED = 401,
    HTTP_FORBIDDEN = 403,
    HTTP_SUCCESS = 200,
    HTTP_BAD_REQUEST = 400
}
export declare class Response<T = any> {
    private _responseCode;
    private _errorMesg;
    private _body;
    responseCode: ResponseCode;
    errorMesg: string;
    body: T;
}
