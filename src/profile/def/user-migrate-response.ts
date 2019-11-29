export interface UserMigrateResponse {
    params: {
        resmsgid: string,
        msgid: string,
        err: string,
        status: string,
        errmsg: string
    };
    responseCode: string;
    response: {};
}
