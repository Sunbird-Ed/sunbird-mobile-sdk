import {Connection} from "./connection";

export abstract class SessionConnection extends Connection {

    abstract withAccessToken(accessToken: string);

}