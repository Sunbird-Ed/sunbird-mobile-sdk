export enum RESPONSE_CODE_TYPE {
    UNAUTHORISED = 401,
    SUCCESS = 200
}

export class Response {

    constructor(private responseCode: RESPONSE_CODE_TYPE,
                private errorMesg: string,
                private body: any) {

    }

    code(): number {
        return this.responseCode;
    }

    error(): Error {
        return new Error(this.errorMesg);
    }

    response(): any {
        return this.body;
    }

    success(): boolean {
        return this.responseCode == 200;
    }

}