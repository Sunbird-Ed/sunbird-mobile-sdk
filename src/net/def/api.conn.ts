import {APIRequest} from "./api.request";
import {APIResponse} from "./api.response";

export abstract class APIConnection {

    abstract invoke(request: APIRequest): Promise<APIResponse>

    abstract useAPIToken(token: string);

}