import {Request} from "./request";
import {Response} from "./response";

export abstract class Connection {

    abstract invoke(request: Request): Promise<Response>

    abstract useAPIToken(token: string);

}