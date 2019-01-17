// definitions
import {ApiConfig, ApiService} from './api';
import {DbConfig, DbService} from './db';
import {AuthService} from './auth';
import {TelemetryService} from './telemetry';
// config
import {SdkConfig} from './sdk-config';
// implementations
import {DbServiceImpl} from './db/impl/db-service-impl';
import {TelemetryDecoratorImpl} from './telemetry/impl/decorator-impl';
import {TelemetryServiceImpl} from './telemetry/impl/telemetry-service-impl';
import {AuthServiceImpl} from './auth/auth-service-impl';

export class SunbirdSdk {

    private static readonly _instance?: SunbirdSdk;

    public static get instance(): SunbirdSdk {
        if (!SunbirdSdk._instance) {
            return new SunbirdSdk();
        }

        return SunbirdSdk._instance;
    }

    private _dbService: DbService;
    private _telemetryService: TelemetryService;
    private _authService: AuthService;

    public init(sdkConfig: SdkConfig) {
        this.initDbService(sdkConfig.dbContext);
        this.initTelemetryService();
        this.initApiService(sdkConfig);
    }

    private initAuthService(apiConfig: ApiConfig) {
        this._authService = new AuthServiceImpl(apiConfig);
    }

    private initApiService(sdkConfig: SdkConfig) {
        ApiService.instance.init(sdkConfig.apiConfig);
    }

    private initTelemetryService() {
        const decorator = new TelemetryDecoratorImpl();
        this._telemetryService = new TelemetryServiceImpl(this._dbService, decorator);
    }

    private initDbService(dbConfig: DbConfig) {
        this._dbService = new DbServiceImpl(dbConfig);
    }

    public getDbService(): DbService {
        return this._dbService;
    }

    public getTelemetryService(): TelemetryService {
        return this._telemetryService;
    }

    public getApiService(): ApiService {
        return ApiService.instance;
    }

    public getAuthService(): AuthService {
        return this._authService;
    }
}
