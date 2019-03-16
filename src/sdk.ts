// definitions
import {ApiService, ApiServiceImpl} from './api';
import {DbService} from './db';
import {AuthService} from './auth';
import {TelemetryService} from './telemetry';
import {SharedPreferences} from './util/shared-preferences';
// config
import {SdkConfig} from './sdk-config';
// implementations
import {DbCordovaService} from './db/impl/db-cordova-service';
import {TelemetryDecoratorImpl} from './telemetry/impl/decorator-impl';
import {TelemetryServiceImpl} from './telemetry/impl/telemetry-service-impl';
import {AuthServiceImpl} from './auth/impl/auth-service-impl';
import {ContentFeedbackService, ContentService, ContentsGroupedByPageSection} from './content';
import {CourseService, CourseServiceImpl} from './course';
import {FormService} from './form';
import {
    Channel,
    Framework,
    FrameworkService,
    FrameworkServiceImpl,
    FrameworkUtilService,
    FrameworkUtilServiceImpl
} from './framework';
import {ContentServiceImpl} from './content/impl/content-service-impl';
import {ProfileService, ProfileServiceImpl, ServerProfile} from './profile';
import {KeyValueStore} from './key-value-store';
import {KeyValueStoreImpl} from './key-value-store/impl/key-value-store-impl';
import {FormServiceImpl} from './form/impl/form-service-impl';
import {FileService} from './util/file/def/file-service';
import {CachedItemStoreImpl} from './key-value-store/impl/cached-item-store-impl';
import {PageAssembleService} from './page';
import {PageAssembleServiceImpl} from './page/impl/page-assemble-service-impl';
import {PageAssemble} from './page/def/page-assemble';
import {SharedPreferencesLocalStorage} from './util/shared-preferences/impl/shared-preferences-local-storage';
import {SharedPreferencesAndroid} from './util/shared-preferences/impl/shared-preferences-android';
import {FileServiceImpl} from './util/file/impl/file-service-impl';
import {DbWebSqlService} from './db/impl/db-web-sql-service';
import {ProfileSyllabusMigration} from './db/migrations/profile-syllabus-migration';
import {GroupProfileMigration} from './db/migrations/group-profile-migration';
import {MillisecondsToSecondsMigration} from './db/migrations/milliseconds-to-seconds-migration';
import {ContentMarkerMigration} from './db/migrations/content-marker-migration';
import {GroupService} from './group';
import {GroupServiceImpl} from './group/impl/group-service-impl';
import {DebugPromptFileService} from './util/file/impl/debug-prompt-file-service';
import {SystemSettings, SystemSettingsService, SystemSettingsServiceImpl} from './system-settings';
import {ZipService} from './util/zip/def/zip-service';
import {DeviceInfo} from './util/device/def/device-info';
import {ZipServiceImpl} from './util/zip/impl/zip-service-impl';
import {DeviceInfoImpl} from './util/device/impl/device-info-impl';
import {ContentFeedbackServiceImpl} from './content/impl/content-feedback-service-impl';
import {EventsBusService} from './events-bus';
import {EventsBusServiceImpl} from './events-bus/impl/events-bus-service-impl';
import {SummarizerService} from './summarizer/def/summarizer-service';
import {SummarizerServiceImpl} from './summarizer/impl/summarizer-service-impl';
import {Observable} from 'rxjs';
import {DownloadService} from './util/download';
import {DownloadServiceImpl} from './util/download/download-service-impl';
import {AppInfo} from './util/app/def/app-info';
import {AppInfoImpl} from './util/app/impl/app-info-impl';
import {PlayerService} from './player/def/player-service';
import {PlayerServiceImpl} from './player/impl/player-service-impl';

export class SunbirdSdk {

    private static _instance?: SunbirdSdk;

    public static get instance(): SunbirdSdk {
        if (!SunbirdSdk._instance) {
            SunbirdSdk._instance = new SunbirdSdk();
        }

        return SunbirdSdk._instance;
    }

    private _dbService: DbService;
    private _telemetryService: TelemetryService;
    private _authService: AuthService;
    private _apiService: ApiService;
    private _keyValueStore: KeyValueStore;
    private _profileService: ProfileService;
    private _groupService: GroupService;
    private _contentService: ContentService;
    private _courseService: CourseService;
    private _formService: FormService;
    private _frameworkService: FrameworkService;
    private _frameworkUtilService: FrameworkUtilService;
    private _pageAssembleService: PageAssembleService;
    private _sharedPreferences: SharedPreferences;
    private _fileService: FileService;
    private _systemSettingsService: SystemSettingsService;
    private _zipService: ZipService;
    private _deviceInfo: DeviceInfo;
    private _sdkConfig: SdkConfig;
    private _contentFeedbackService: ContentFeedbackService;
    private _eventsBusService: EventsBusService;
    private _summarizerService: SummarizerService;
    private _downloadService: DownloadService;
    private _appInfo: AppInfo;
    private _playerService: PlayerService;

    get sdkConfig(): SdkConfig {
        return this._sdkConfig;
    }

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

    get groupService(): GroupService {
        return this._groupService;
    }

    get contentService(): ContentService {
        return this._contentService;
    }

    get contentFeedbackService(): ContentFeedbackService {
        return this._contentFeedbackService;
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

    get frameworkUtilService(): FrameworkUtilService {
        return this._frameworkUtilService;
    }

    get sharedPreferences(): SharedPreferences {
        return this._sharedPreferences;
    }

    get systemSettingsService(): SystemSettingsService {
        return this._systemSettingsService;
    }

    get eventsBusService(): EventsBusService {
        return this._eventsBusService;
    }

    get summarizerService(): SummarizerService {
        return this._summarizerService;
    }

    get downloadService(): DownloadService {
        return this._downloadService;
    }

    get playerService(): PlayerService {
        return this._playerService;
    }

    public async init(sdkConfig: SdkConfig) {
        this._sdkConfig = Object.freeze(sdkConfig);

        this._deviceInfo = new DeviceInfoImpl(this.sdkConfig);

        if (sdkConfig.sharedPreferencesConfig.debugMode) {
            this._sharedPreferences = new SharedPreferencesLocalStorage();
        } else {
            this._sharedPreferences = new SharedPreferencesAndroid();
        }

        this._eventsBusService = new EventsBusServiceImpl(this.sdkConfig.eventsBusConfig);

        if (sdkConfig.dbConfig.debugMode === true) {
            this._dbService = new DbWebSqlService(
                sdkConfig.dbConfig,
                20,
                [
                    new ProfileSyllabusMigration(),
                    new GroupProfileMigration(),
                    new MillisecondsToSecondsMigration(),
                    new ContentMarkerMigration()
                ]
            );
        } else {
            this._dbService = new DbCordovaService(
                sdkConfig.dbConfig,
                20,
                [
                    new ProfileSyllabusMigration(),
                    new GroupProfileMigration(),
                    new MillisecondsToSecondsMigration(),
                    new ContentMarkerMigration()
                ]
            );
        }
        this._appInfo = new AppInfoImpl(this._sdkConfig);

        await this._dbService.init();
        await this._appInfo.init();

        this._apiService = new ApiServiceImpl(sdkConfig.apiConfig, this._deviceInfo, this._sharedPreferences);

        this._authService = new AuthServiceImpl(sdkConfig.apiConfig, this._apiService, this._sharedPreferences);

        this._keyValueStore = new KeyValueStoreImpl(this._dbService);


        if (sdkConfig.fileConfig.debugMode === true) {
            this._fileService = new DebugPromptFileService();
        } else {
            this._fileService = new FileServiceImpl();
        }

        this._systemSettingsService = new SystemSettingsServiceImpl(
            sdkConfig.systemSettingsConfig,
            this._apiService,
            this._fileService,
            new CachedItemStoreImpl<SystemSettings>(this._keyValueStore, sdkConfig.apiConfig, this._sharedPreferences),
        );

        this._frameworkService = new FrameworkServiceImpl(
            sdkConfig,
            this._keyValueStore,
            this._fileService,
            this._apiService,
            new CachedItemStoreImpl<Channel>(this._keyValueStore, sdkConfig.apiConfig, this._sharedPreferences),
            new CachedItemStoreImpl<Framework>(this._keyValueStore, sdkConfig.apiConfig, this._sharedPreferences),
            this._sharedPreferences,
            this._systemSettingsService
        );

        this._profileService = new ProfileServiceImpl(
            sdkConfig.profileServiceConfig,
            this._dbService,
            this._apiService,
            new CachedItemStoreImpl<ServerProfile>(this._keyValueStore, sdkConfig.apiConfig, this._sharedPreferences),
            this._keyValueStore,
            this._sharedPreferences,
            this._frameworkService
        );

        this._groupService = new GroupServiceImpl(
            this._dbService,
            this._profileService,
            this._keyValueStore,
            this._sharedPreferences
        );

        this._zipService = new ZipServiceImpl();

        this._telemetryService = new TelemetryServiceImpl(
            this._dbService,
            new TelemetryDecoratorImpl(sdkConfig.apiConfig, this._deviceInfo, this._appInfo),
            this._profileService,
            this._groupService,
            this._keyValueStore,
            this._apiService,
            this._sdkConfig.telemetryConfig,
            this._deviceInfo,
            this._eventsBusService,
            this._fileService
        );

        this._contentFeedbackService = new ContentFeedbackServiceImpl(this._dbService, this._profileService, this._telemetryService);

        this._courseService = new CourseServiceImpl(
            sdkConfig.courseServiceConfig,
            this._apiService,
            this._profileService,
            this._keyValueStore
        );

        this._formService = new FormServiceImpl(
            sdkConfig.formServiceConfig,
            this._apiService,
            this._fileService,
            new CachedItemStoreImpl<{ [key: string]: {} }>(this._keyValueStore, sdkConfig.apiConfig, this._sharedPreferences)
        );

        this._pageAssembleService = new PageAssembleServiceImpl(
            this._apiService,
            sdkConfig.pageServiceConfig,
            this._fileService,
            new CachedItemStoreImpl<PageAssemble>(this._keyValueStore, sdkConfig.apiConfig, this._sharedPreferences)
        );

        this._frameworkUtilService = new FrameworkUtilServiceImpl(
            this._sharedPreferences,
            this._frameworkService,
            this._profileService
        );


        this._downloadService = new DownloadServiceImpl(this._eventsBusService, this._sharedPreferences);

        this._contentService = new ContentServiceImpl(
            sdkConfig.contentServiceConfig,
            this._apiService,
            this._dbService,
            this._profileService,
            sdkConfig.appConfig,
            this._fileService,
            this._zipService,
            this._deviceInfo,
            this.telemetryService,
            this._contentFeedbackService,
            this._downloadService,
            this._sharedPreferences,
            this._eventsBusService,
            new CachedItemStoreImpl<ContentsGroupedByPageSection>(this._keyValueStore, sdkConfig.apiConfig, this._sharedPreferences)
        );

        this._summarizerService = new SummarizerServiceImpl(this._dbService, this.contentService, this._eventsBusService);

        this._downloadService.registerOnDownloadCompleteDelegate(this._contentService);
        this._playerService = new PlayerServiceImpl(this._profileService, this._groupService,
            this._sdkConfig, this._frameworkService, this._deviceInfo, this._appInfo);

        await this._profileService.onInit().toPromise();

        this.postInit();
    }

    private postInit() {
        Observable.combineLatest(
            this._frameworkService.onInit(),
            this._eventsBusService.onInit(),
            this._downloadService.onInit()
        ).subscribe();
    }
}
