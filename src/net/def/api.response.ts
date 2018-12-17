export enum RESPONSE_CODE_TYPE {
    UNAUTHORISED = 401,
    SUCCESS = 200
}

export interface APIResponse {

    success(): boolean;

    code(): RESPONSE_CODE_TYPE;

    response(): any;

    error(): Error;

}