// definitions
import {ApiService, ApiServiceImpl} from './api';
import {DbService, Migration} from './db';
import {AuthService} from './auth';
import {TelemetryDecorator, TelemetryService} from './telemetry';
import {SharedPreferences} from './util/shared-preferences';
// config
import {SdkConfig} from './sdk-config';
// implementations
import {DbCordovaService} from './db/impl/db-cordova-service';
import {TelemetryDecoratorImpl} from './telemetry/impl/decorator-impl';
import {TelemetryServiceImpl} from './telemetry/impl/telemetry-service-impl';
import {AuthServiceImpl} from './auth/impl/auth-service-impl';
import {ContentFeedbackService, ContentService, ContentServiceConfig} from './content';
import {CourseService, CourseServiceImpl} from './course';
import {FormService} from './form';
import {FrameworkService, FrameworkServiceImpl, FrameworkUtilService, FrameworkUtilServiceImpl} from './framework';
import {ContentServiceImpl} from './content/impl/content-service-impl';
import {ProfileService, ProfileServiceImpl} from './profile';
import {CachedItemStore, KeyValueStore} from './key-value-store';
import {KeyValueStoreImpl} from './key-value-store/impl/key-value-store-impl';
import {FormServiceImpl} from './form/impl/form-service-impl';
import {FileService} from './util/file/def/file-service';
import {CachedItemStoreImpl} from './key-value-store/impl/cached-item-store-impl';
import {PageAssembleService, PageServiceConfig} from './page';
import {PageAssembleServiceImpl} from './page/impl/page-assemble-service-impl';
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
import {SystemSettingsService, SystemSettingsServiceImpl} from './system-settings';
import {ZipService} from './util/zip/def/zip-service';
import {DeviceInfo} from './util/device';
import {ZipServiceImpl} from './util/zip/impl/zip-service-impl';
import {DeviceInfoImpl} from './util/device/impl/device-info-impl';
import {ContentFeedbackServiceImpl} from './content/impl/content-feedback-service-impl';
import {EventsBusService} from './events-bus';
import {EventsBusServiceImpl} from './events-bus/impl/events-bus-service-impl';
import {SummarizerService, SummarizerServiceImpl} from './summarizer';
import {Observable} from 'rxjs';
import {DownloadService} from './util/download';
import {DownloadServiceImpl} from './util/download/impl/download-service-impl';
import {AppInfo} from './util/app/def/app-info';
import {AppInfoImpl} from './util/app/impl/app-info-impl';
import {PlayerService, PlayerServiceImpl} from './player';
import {TelemetryConfig} from './telemetry/config/telemetry-config';
import {OfflineSearchTextbookMigration} from './db/migrations/offline-search-textbook-migration';
import {ApiAuthenticator} from './util/authenticators/impl/api-authenticator';
import {SessionAuthenticator} from './util/authenticators/impl/session-authenticator';
import {Container} from 'inversify';
import {InjectionTokens} from './injection-tokens';

export class SunbirdSdk {
    private static _instance?: SunbirdSdk;

    public static get instance(): SunbirdSdk {
        if (!SunbirdSdk._instance) {
            SunbirdSdk._instance = new SunbirdSdk();
        }

        return SunbirdSdk._instance;
    }

    private _container: Container;

    get sdkConfig(): SdkConfig {
        return this._container.get<SdkConfig>(InjectionTokens.SDK_CONFIG);
    }

    get appInfo(): AppInfo {
        return this._container.get<AppInfo>(InjectionTokens.APP_INFO);
    }

    get pageAssembleService(): PageAssembleService {
        return this._container.get<PageAssembleService>(InjectionTokens.PAGE_ASSEMBLE_SERVICE);
    }

    get dbService(): DbService {
        return this._container.get<DbService>(InjectionTokens.DB_SERVICE);
    }

    get telemetryService(): TelemetryService {
        return this._container.get<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE);
    }

    get authService(): AuthService {
        return this._container.get<AuthService>(InjectionTokens.AUTH_SERVICE);
    }

    get apiService(): ApiService {
        return this._container.get<ApiService>(InjectionTokens.API_SERVICE);
    }

    get keyValueStore(): KeyValueStore {
        return this._container.get<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE);
    }

    get profileService(): ProfileService {
        return this._container.get<ProfileService>(InjectionTokens.PROFILE_SERVICE);
    }

    get groupService(): GroupService {
        return this._container.get<GroupService>(InjectionTokens.GROUP_SERVICE);
    }

    get contentService(): ContentService {
        return this._container.get<ContentService>(InjectionTokens.CONTENT_SERVICE);
    }

    get contentFeedbackService(): ContentFeedbackService {
        return this._container.get<ContentFeedbackService>(InjectionTokens.CONTENT_FEEDBACK_SERVICE);
    }

    get courseService(): CourseService {
        return this._container.get<CourseService>(InjectionTokens.CONTENT_SERVICE);
    }

    get formService(): FormService {
        return this._container.get<FormService>(InjectionTokens.FORM_SERVICE);
    }

    get frameworkService(): FrameworkService {
        return this._container.get<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE);
    }

    get frameworkUtilService(): FrameworkUtilService {
        return this._container.get<FrameworkUtilService>(InjectionTokens.FRAMEWORK_UTIL_SERVICE);
    }

    get sharedPreferences(): SharedPreferences {
        return this._container.get<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES);
    }

    get systemSettingsService(): SystemSettingsService {
        return this._container.get<SystemSettingsService>(InjectionTokens.SYSTEM_SETTINGS_SERVICE);
    }

    get eventsBusService(): EventsBusService {
        return this._container.get<EventsBusService>(InjectionTokens.EVENTS_BUS_SERVICE);
    }

    get summarizerService(): SummarizerService {
        return this._container.get<SummarizerService>(InjectionTokens.SUMMARIZER_SERVICE);
    }

    get downloadService(): DownloadService {
        return this._container.get<DownloadService>(InjectionTokens.DOWNLOAD_SERVICE);
    }

    get playerService(): PlayerService {
        return this._container.get<PlayerService>(InjectionTokens.PLAYER_SERVICE);
    }

    get deviceInfo(): DeviceInfo {
        return this._container.get<DeviceInfo>(InjectionTokens.DEVICE_INFO);
    }

    public async init(sdkConfig: SdkConfig) {
        this._container = new Container();

        this._container.bind<number>(InjectionTokens.DB_VERSION).toConstantValue(21);

        this._container.bind<Migration[]>(InjectionTokens.DB_MIGRATION_LIST).toConstantValue([
            new ProfileSyllabusMigration(),
            new GroupProfileMigration(),
            new MillisecondsToSecondsMigration(),
            new ContentMarkerMigration(),
            new OfflineSearchTextbookMigration()
        ]);

        if (sdkConfig.sharedPreferencesConfig.debugMode) {
            this._container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).to(SharedPreferencesLocalStorage);
        } else {
            this._container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).to(SharedPreferencesAndroid);
        }

        if (sdkConfig.dbConfig.debugMode) {
            this._container.bind<DbService>(InjectionTokens.DB_SERVICE).to(DbWebSqlService);
        } else {
            this._container.bind<DbService>(InjectionTokens.DB_SERVICE).to(DbCordovaService);
        }

        if (sdkConfig.fileConfig.debugMode) {
            this._container.bind<FileService>(InjectionTokens.FILE_SERVICE).to(DebugPromptFileService);
        } else {
            this._container.bind<FileService>(InjectionTokens.FILE_SERVICE).to(FileServiceImpl);
        }

        this._container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(sdkConfig);

        this._container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).to(DeviceInfoImpl);

        this._container.bind<EventsBusService>(InjectionTokens.EVENTS_BUS_SERVICE).to(EventsBusServiceImpl);

        this._container.bind<AppInfo>(InjectionTokens.APP_INFO).to(AppInfoImpl);

        this._container.bind<ApiService>(InjectionTokens.API_SERVICE).to(ApiServiceImpl);

        this._container.bind<AuthService>(InjectionTokens.AUTH_SERVICE).to(AuthServiceImpl);

        this._container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).to(KeyValueStoreImpl);

        this._container.bind<SystemSettingsService>(InjectionTokens.SYSTEM_SETTINGS_SERVICE).to(SystemSettingsServiceImpl);

        this._container.bind<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE).to(FrameworkServiceImpl);

        this._container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).to(ProfileServiceImpl);

        this._container.bind<GroupService>(InjectionTokens.GROUP_SERVICE).to(GroupServiceImpl);

        this._container.bind<ZipService>(InjectionTokens.ZIP_SERVICE).to(ZipServiceImpl);

        this._container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).to(TelemetryServiceImpl);

        this._container.bind<ContentFeedbackService>(InjectionTokens.CONTENT_FEEDBACK_SERVICE).to(ContentFeedbackServiceImpl);

        this._container.bind<FormService>(InjectionTokens.FORM_SERVICE).to(FormServiceImpl);

        this._container.bind<PageAssembleService>(InjectionTokens.PAGE_ASSEMBLE_SERVICE).to(PageAssembleServiceImpl);

        this._container.bind<FrameworkUtilService>(InjectionTokens.FRAMEWORK_UTIL_SERVICE).to(FrameworkUtilServiceImpl);

        this._container.bind<DownloadService>(InjectionTokens.DOWNLOAD_SERVICE).to(DownloadServiceImpl);

        this._container.bind<ContentService>(InjectionTokens.CONTENT_SERVICE).to(ContentServiceImpl);

        this._container.bind<CourseService>(InjectionTokens.COURSE_SERVICE).to(CourseServiceImpl);

        this._container.bind<SummarizerService>(InjectionTokens.SUMMARIZER_SERVICE).to(SummarizerServiceImpl);

        this._container.bind<PlayerService>(InjectionTokens.PLAYER_SERVICE).to(PlayerServiceImpl);

        this._container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).to(CachedItemStoreImpl);

        this._container.bind<TelemetryDecorator>(InjectionTokens.TELEMETRY_DECORATOR).to(TelemetryDecoratorImpl);

        this.apiService.setDefaultApiAuthenticators([
            new ApiAuthenticator(this.sharedPreferences, this.sdkConfig.apiConfig, this.deviceInfo, this.apiService)
        ]);

        this.apiService.setDefaultSessionAuthenticators([
            new SessionAuthenticator(this.sharedPreferences, this.sdkConfig.apiConfig, this.apiService, this.authService)
        ]);

        await this.dbService.init();
        await this.appInfo.init();
        await this.preInit().toPromise();

        this.postInit().subscribe();
    }

    public updateTelemetryConfig(update: Partial<TelemetryConfig>) {
        for (const key in update) {
            if (update.hasOwnProperty(key)) {
                this.sdkConfig.telemetryConfig[key] = update[key];
            }
        }
    }

    public updateContentServiceConfig(update: Partial<ContentServiceConfig>) {
        for (const key in update) {
            if (update.hasOwnProperty(key)) {
                this.sdkConfig.contentServiceConfig[key] = update[key];
            }
        }
    }

    public updatePageServiceConfig(update: Partial<PageServiceConfig>) {
        for (const key in update) {
            if (update.hasOwnProperty(key)) {
                this.sdkConfig.pageServiceConfig[key] = update[key];
            }
        }
    }

    private preInit() {
        return Observable.combineLatest(
            this.profileService.preInit()
        );
    }

    private postInit() {
        return Observable.combineLatest(
            this.frameworkService.onInit(),
            this.eventsBusService.onInit(),
            this.downloadService.onInit(),
            this.contentService.onInit()
        );
    }
}
