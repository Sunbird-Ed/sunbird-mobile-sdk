import { ApiConfig, Connection } from '../index';
import { Observable } from 'rxjs';
export declare class ApiTokenHandler {
    private config;
    constructor(config: ApiConfig);
    refreshAuthToken(connection: Connection): Observable<string>;
    private buildResetTokenAPIRequest;
    private generateMobileDeviceConsumerBearerToken;
}
