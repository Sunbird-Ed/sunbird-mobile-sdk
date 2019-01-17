// definitions
import {ApiServiceImpl} from './api';
import {DbService} from './db';
import {AuthService, SessionAuthenticator} from './auth';
import {TelemetryService} from './telemetry';
// config
import {SdkConfig} from './sdk-config';
// implementations
import {DbServiceImpl} from './db/impl/db-service-impl';
import {TelemetryDecoratorImpl} from './telemetry/impl/decorator-impl';
import {TelemetryServiceImpl} from './telemetry/impl/telemetry-service-impl';
import {AuthServiceImpl} from './auth/auth-service-impl';
import {ContentService} from './content/def/content-service';
import {CourseService} from './course/def/course-service';
import {FormService} from './form/def/form-service';
import {FrameworkService} from './framework/def/framework-service';
import {ContentServiceImpl} from './content/impl/content-service-impl';
import {ProfileService, ProfileServiceImpl} from './profile';
import {KeyValueStore} from './key-value-store';
import {ApiService} from './api/def/api-service';
import {KeyValueStoreImpl} from './key-value-store/impl/key-value-store-impl';
import {CourseServiceImpl} from './course';
import {FormServiceImpl} from './form/impl/form-service-impl';
import {FileService} from './util/file/def/file-service';
import {CachedItemStoreImpl} from './key-value-store/impl/cached-item-store-impl';
import {Channel, Framework, FrameworkServiceImpl} from './framework';
import {ServerProfile} from './profile/def/server-profile';

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
    private _apiService: ApiService;
    private _keyValueStore: KeyValueStore;
    private _profileService: ProfileService;
    private _contentService: ContentService;
    private _courseService: CourseService;
    private _formService: FormService;
    private _frameworkService: FrameworkService;

    public init(sdkConfig: SdkConfig) {
        this._dbService = new DbServiceImpl(sdkConfig.dbContext);

        this._telemetryService = new TelemetryServiceImpl(this._dbService, new TelemetryDecoratorImpl());

        this._apiService = new ApiServiceImpl(sdkConfig.apiConfig);

        this._authService = new AuthServiceImpl(sdkConfig.apiConfig, this._apiService);

        this._keyValueStore = new KeyValueStoreImpl(this._dbService);

        const sessionAuthenticator = new SessionAuthenticator(sdkConfig.apiConfig, this._apiService);
        const fileService: FileService = {} as any;

        this._profileService = new ProfileServiceImpl(
            sdkConfig.profileServiceConfig,
            this._dbService,
            this._apiService,
            new CachedItemStoreImpl<ServerProfile>(this._keyValueStore, sdkConfig.apiConfig),
            sessionAuthenticator
        );

        this._contentService = new ContentServiceImpl(
            sdkConfig.contentServiceConfig,
            this._apiService,
            this._dbService,
            this._profileService,
            this._keyValueStore,
            sessionAuthenticator
        );

        this._courseService = new CourseServiceImpl(
            sdkConfig.courseServiceConfig,
            this._apiService,
            this._profileService,
            this._keyValueStore,
            sessionAuthenticator
        );

        this._formService = new FormServiceImpl(
            sdkConfig.formServiceConfig,
            this._apiService,
            this._dbService,
            fileService,
            new CachedItemStoreImpl<{ [key: string]: {} }>(this._keyValueStore, sdkConfig.apiConfig),
            sessionAuthenticator
        );

        this._frameworkService = new FrameworkServiceImpl(
            sdkConfig.frameworkServiceConfig,
            this._keyValueStore,
            fileService,
            this._apiService,
            new CachedItemStoreImpl<Channel>(this._keyValueStore, sdkConfig.apiConfig),
            new CachedItemStoreImpl<Framework>(this._keyValueStore, sdkConfig.apiConfig),
            sessionAuthenticator
        );
    }

    get dbService(): DbService {
        return this._dbService;
    }

    get telemetryService(): TelemetryService {
        return this._telemetryService;
    }

    get authService(): AuthService {
        return this._authService;
    }

    get apiService(): ApiService {
        return this._apiService;
    }

    get keyValueStore(): KeyValueStore {
        return this._keyValueStore;
    }

    get profileService(): ProfileService {
        return this._profileService;
    }

    get contentService(): ContentService {
        return this._contentService;
    }

    get courseService(): CourseService {
        return this._courseService;
    }

    get formService(): FormService {
        return this._formService;
    }

    get frameworkService(): FrameworkService {
        return this._frameworkService;
    }
}
