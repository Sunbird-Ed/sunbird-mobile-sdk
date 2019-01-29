// definitions
import {ApiService, ApiServiceImpl} from './api';
import {DbService} from './db';
import {AuthService, SessionAuthenticator} from './auth';
import {TelemetryService} from './telemetry';
import {SharedPreference} from './util/shared-preference';
// config
import {SdkConfig} from './sdk-config';
// implementations
import {DbServiceImpl} from './db/impl/db-service-impl';
import {TelemetryDecoratorImpl} from './telemetry/impl/decorator-impl';
import {TelemetryServiceImpl} from './telemetry/impl/telemetry-service-impl';
import {AuthServiceImpl} from './auth/auth-service-impl';
import {ContentService} from './content';
import {CourseService, CourseServiceImpl} from './course';
import {FormService} from './form';
import {Channel, Framework, FrameworkService, FrameworkServiceImpl} from './framework';
import {ContentServiceImpl} from './content/impl/content-service-impl';
import {ProfileService, ProfileServiceImpl} from './profile';
import {KeyValueStore} from './key-value-store';
import {KeyValueStoreImpl} from './key-value-store/impl/key-value-store-impl';
import {FormServiceImpl} from './form/impl/form-service-impl';
import {FileService} from './util/file/def/file-service';
import {CachedItemStoreImpl} from './key-value-store/impl/cached-item-store-impl';
import {ServerProfile} from './profile/def/server-profile';
import {PageAssembleService} from './page';
import {PageAssembleServiceImpl} from './page/impl/page-assemble-service-impl';
import {PageAssemble} from './page/def/page-assemble';
import {SharedPreferenceImpl} from './util/shared-preference/impl/shared-preference-impl';

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
    private _pageAssembleService: PageAssembleService;
    private _sharedPreference: SharedPreference;

    get pageAssembleService(): PageAssembleService {
        return this._pageAssembleService;
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

    get sharedPreference(): SharedPreference {
        return this._sharedPreference;
    }

    public init(sdkConfig: SdkConfig) {
        this._sharedPreference = new SharedPreferenceImpl();

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
            this._keyValueStore,
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

        this._pageAssembleService = new PageAssembleServiceImpl(
            this._apiService,
            sdkConfig.pageServiceConfig,
            fileService,
            sessionAuthenticator,
            new CachedItemStoreImpl<PageAssemble>(this._keyValueStore, sdkConfig.apiConfig)
        );
    }
}
