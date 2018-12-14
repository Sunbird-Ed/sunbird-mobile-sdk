export interface APIResponse {

    success(): boolean;

    code(): number;

    response(): any;

    error(): Error;

}