import {SunbirdAPIConnection} from "./sunbird.api.conn";
import {SessionAPIConnection} from "../def/api.session.conn";

export class SunbirdSessionApiConnection extends SunbirdAPIConnection implements SessionAPIConnection{

    withAccessToken(accessToken: string) {
        this.http.addHeader("X-Authenticated-User-Token", accessToken);
    }

}