import {SunbirdConnection} from "./sunbird-connection";
import {SessionConnection} from "../def/session-connection";

export class SunbirdSessionConnection extends SunbirdConnection implements SessionConnection {
    withAccessToken(accessToken: string) {
        this.http.addHeader("X-Authenticated-User-Token", accessToken);
    }
}