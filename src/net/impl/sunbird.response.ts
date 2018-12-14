import {APIResponse} from "../def/api.response";

export class SunbirdAPIResponse implements APIResponse{

    constructor(private responseCode: number,
                private errorMesg: string,
                private body: string) {

    }

    code(): number {
        return this.responseCode;
    }

    error(): Error {
        return new Error(this.errorMesg);
    }

    response(): any {
        return JSON.parse(this.body);
    }

    success(): boolean {
        return this.responseCode == 200;
    }

}