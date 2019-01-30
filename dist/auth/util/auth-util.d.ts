import { Connection } from '../../api';
import { OauthSession } from '..';
import { Observable } from 'rxjs';
import { ApiService } from '../../api/def/api-service';
export declare class AuthUtil {
    private apiService;
    constructor(apiService: ApiService);
    refreshSession(connection: Connection, authUrl: string): Promise<OauthSession>;
    startSession(sessionData: OauthSession): Promise<undefined>;
    endSession(): Promise<undefined>;
    getSessionData(): Observable<OauthSession>;
}
