export enum REQUEST_TYPE {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH"
}

export class Request {

    constructor(public path: string,
                public type: REQUEST_TYPE,
                public headers?: any,
                public body?: string,
                public parameters?: string) {
    }

}