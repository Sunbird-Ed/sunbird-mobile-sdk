import {APIConnection} from "./api.conn";

export abstract class SessionAPIConnection extends APIConnection{

    abstract withAccessToken(accessToken: string);

}