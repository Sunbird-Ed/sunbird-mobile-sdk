import {HttpService, HttpServiceImpl} from './native/http';
import {DbService, Migration} from './native/db';
import {AuthService} from './services/auth';
import {TelemetryDecorator, TelemetryService} from './services/telemetry';
import {SharedPreferences} from './native/shared-preferences';
import {SdkConfig} from './sdk-config';
import {DbCordovaService} from './native/db/impl/db-cordova-service';
import {TelemetryDecoratorImpl} from './services/telemetry/impl/decorator-impl';
import {TelemetryServiceImpl} from './services/telemetry/impl/telemetry-service-impl';
import {AuthServiceImpl} from './services/auth/impl/auth-service-impl';
import {ContentFeedbackService, ContentService, ContentServiceConfig} from './services/content';
import {CourseService, CourseServiceImpl} from './services/course';
import {FormService} from './services/form';
import {FrameworkService, FrameworkServiceImpl, FrameworkUtilService, FrameworkUtilServiceImpl} from './services/framework';
import {ContentServiceImpl} from './services/content/impl/content-service-impl';
import {ProfileService, ProfileServiceImpl} from './services/profile';
import {CachedItemStore, KeyValueStore} from './services/key-value-store';
import {KeyValueStoreImpl} from './services/key-value-store/impl/key-value-store-impl';
import {FormServiceImpl} from './services/form/impl/form-service-impl';
import {FileService} from './native/file/def/file-service';
import {CachedItemStoreImpl} from './services/key-value-store/impl/cached-item-store-impl';
import {PageAssembleService, PageServiceConfig} from './services/page';
import {PageAssembleServiceImpl} from './services/page/impl/page-assemble-service-impl';
import {SharedPreferencesLocalStorage} from './native/shared-preferences/impl/shared-preferences-local-storage';
import {SharedPreferencesAndroid} from './native/shared-preferences/impl/shared-preferences-android';
import {FileServiceImpl} from './native/file/impl/file-service-impl';
import {DbWebSqlService} from './native/db/impl/db-web-sql-service';
import {ProfileSyllabusMigration} from './native/db/migrations/profile-syllabus-migration';
import {GroupProfileMigration} from './native/db/migrations/group-profile-migration';
import {MillisecondsToSecondsMigration} from './native/db/migrations/milliseconds-to-seconds-migration';
import {ErrorStackMigration} from './native/db/migrations/error-stack-migration';
import {ContentMarkerMigration} from './native/db/migrations/content-marker-migration';
import {GroupService} from './services/group';
import {GroupServiceImpl} from './services/group/impl/group-service-impl';
import {DebugPromptFileService} from './native/file/impl/debug-prompt-file-service';
import {SystemSettingsService, SystemSettingsServiceImpl} from './services/system-settings';
import {ZipService} from './native/util/zip/def/zip-service';
import {DeviceInfo} from './native/device';
import {ZipServiceImpl} from './native/util/zip/impl/zip-service-impl';
import {DeviceInfoImpl} from './native/device/impl/device-info-impl';
import {ContentFeedbackServiceImpl} from './services/content/impl/content-feedback-service-impl';
import {EventsBusService} from './services/events-bus';
import {EventsBusServiceImpl} from './services/events-bus/impl/events-bus-service-impl';
import {SummarizerService, SummarizerServiceImpl} from './services/summarizer';
import {Observable} from 'rxjs';
import {DownloadService} from './native/download';
import {DownloadServiceImpl} from './native/download/impl/download-service-impl';
import {AppInfo} from './native/app/def/app-info';
import {AppInfoImpl} from './native/app/impl/app-info-impl';
import {PlayerService, PlayerServiceImpl} from './services/player';
import {TelemetryConfig} from './services/telemetry/config/telemetry-config';
import {OfflineSearchTextbookMigration} from './native/db/migrations/offline-search-textbook-migration';
import {ApiAuthenticator} from './services/util/authenticators/impl/api-authenticator';
import {SessionAuthenticator} from './services/util/authenticators/impl/session-authenticator';
import {Container} from 'inversify';
import {InjectionTokens} from './injection-tokens';
import {StorageService} from './services/storage';
import {StorageServiceImpl} from './services/storage/impl/storage-service-impl';
import {NotificationService} from './native/notification/def/notification-service';
import {NotificationServiceImpl} from './native/notification/impl/notification-service-impl';
import {ErrorLoggerService} from './services/error-stack/def/error-logger-service';
import {ErrorLoggerServiceImpl} from './services/error-stack/impl/error-logger-service-impl';
import {NetworkInfoService} from './native/network-info';
import {NetworkInfoServiceImpl} from './native/network-info/impl/network-info-service-impl';
import {SearchHistoryMigration} from './native/db/migrations/search-history-migration';
import {SearchHistoryService} from './services/search-history';
import {SearchHistoryServiceImpl} from './services/search-history/impl/search-history-service-impl';
import {Environments} from './environments';

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

    get apiService(): HttpService {
        return this._container.get<HttpService>(InjectionTokens.API_SERVICE);
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
        return this._container.get<CourseService>(InjectionTokens.COURSE_SERVICE);
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

    get storageService(): StorageService {
        return this._container.get<StorageService>(InjectionTokens.STORAGE_SERVICE);
    }

    get notificationService(): NotificationService {
        return this._container.get<NotificationService>(InjectionTokens.NOTIFICATION_SERVICE);
    }
    get errorLoggerService(): ErrorLoggerService {
        return this._container.get<ErrorLoggerService>(InjectionTokens.ERROR_LOGGER_SERVICE);
    }

    get networkInfoService(): NetworkInfoService {
        return this._container.get<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE);
    }

    get searchHistoryService(): SearchHistoryService {
        return this._container.get<SearchHistoryService>(InjectionTokens.SEARCH_HISTORY_SERVICE);
    }

    public async init(sdkConfig: SdkConfig) {
        this._container = new Container();

        this._container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(this._container);

        this._container.bind<number>(InjectionTokens.DB_VERSION).toConstantValue(23);

        this._container.bind<Migration[]>(InjectionTokens.DB_MIGRATION_LIST).toConstantValue([
            new ProfileSyllabusMigration(),
            new GroupProfileMigration(),
            new MillisecondsToSecondsMigration(),
            new ContentMarkerMigration(),
            new OfflineSearchTextbookMigration(),
            new ErrorStackMigration(),
            new SearchHistoryMigration()
        ]);

        if (sdkConfig.environment === Environments.ELECTRON) {
            this._container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).to(SharedPreferencesLocalStorage).inSingletonScope();
        } else {
            this._container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).to(SharedPreferencesAndroid).inSingletonScope();
        }

        if (sdkConfig.environment === Environments.ELECTRON) {
            this._container.bind<DbService>(InjectionTokens.DB_SERVICE).to(DbWebSqlService).inSingletonScope();
        } else {
            this._container.bind<DbService>(InjectionTokens.DB_SERVICE).to(DbCordovaService).inSingletonScope();
        }

        if (sdkConfig.environment === Environments.ELECTRON) {
            this._container.bind<FileService>(InjectionTokens.FILE_SERVICE).to(DebugPromptFileService).inSingletonScope();
        } else {
            this._container.bind<FileService>(InjectionTokens.FILE_SERVICE).to(FileServiceImpl).inSingletonScope();
        }

        this._container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(sdkConfig);

        this._container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).to(DeviceInfoImpl).inSingletonScope();

        this._container.bind<EventsBusService>(InjectionTokens.EVENTS_BUS_SERVICE).to(EventsBusServiceImpl).inSingletonScope();

        this._container.bind<AppInfo>(InjectionTokens.APP_INFO).to(AppInfoImpl).inSingletonScope();

        this._container.bind<HttpService>(InjectionTokens.API_SERVICE).to(HttpServiceImpl).inSingletonScope();

        this._container.bind<AuthService>(InjectionTokens.AUTH_SERVICE).to(AuthServiceImpl).inSingletonScope();

        this._container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).to(KeyValueStoreImpl).inSingletonScope();

        this._container.bind<SystemSettingsService>(InjectionTokens.SYSTEM_SETTINGS_SERVICE).to(SystemSettingsServiceImpl).inSingletonScope();

        this._container.bind<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE).to(FrameworkServiceImpl).inSingletonScope();

        this._container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).to(ProfileServiceImpl).inSingletonScope();

        this._container.bind<GroupService>(InjectionTokens.GROUP_SERVICE).to(GroupServiceImpl).inSingletonScope();

        this._container.bind<ErrorLoggerService>(InjectionTokens.ERROR_LOGGER_SERVICE).to(ErrorLoggerServiceImpl).inSingletonScope();

        this._container.bind<ZipService>(InjectionTokens.ZIP_SERVICE).to(ZipServiceImpl).inSingletonScope();

        this._container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).to(TelemetryServiceImpl).inSingletonScope();

        this._container.bind<ContentFeedbackService>(InjectionTokens.CONTENT_FEEDBACK_SERVICE).to(ContentFeedbackServiceImpl).inSingletonScope();

        this._container.bind<FormService>(InjectionTokens.FORM_SERVICE).to(FormServiceImpl).inSingletonScope();

        this._container.bind<PageAssembleService>(InjectionTokens.PAGE_ASSEMBLE_SERVICE).to(PageAssembleServiceImpl).inSingletonScope();

        this._container.bind<FrameworkUtilService>(InjectionTokens.FRAMEWORK_UTIL_SERVICE).to(FrameworkUtilServiceImpl).inSingletonScope();

        this._container.bind<DownloadService>(InjectionTokens.DOWNLOAD_SERVICE).to(DownloadServiceImpl).inSingletonScope();

        this._container.bind<ContentService>(InjectionTokens.CONTENT_SERVICE).to(ContentServiceImpl).inSingletonScope();

        this._container.bind<CourseService>(InjectionTokens.COURSE_SERVICE).to(CourseServiceImpl).inSingletonScope();

        this._container.bind<SummarizerService>(InjectionTokens.SUMMARIZER_SERVICE).to(SummarizerServiceImpl).inSingletonScope();

        this._container.bind<PlayerService>(InjectionTokens.PLAYER_SERVICE).to(PlayerServiceImpl).inSingletonScope();

        this._container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).to(CachedItemStoreImpl).inSingletonScope();

        this._container.bind<TelemetryDecorator>(InjectionTokens.TELEMETRY_DECORATOR).to(TelemetryDecoratorImpl).inSingletonScope();

        this._container.bind<StorageService>(InjectionTokens.STORAGE_SERVICE).to(StorageServiceImpl).inSingletonScope();

        this._container.bind<NotificationService>(InjectionTokens.NOTIFICATION_SERVICE).to(NotificationServiceImpl).inSingletonScope();

        this._container.bind<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE).to(NetworkInfoServiceImpl).inSingletonScope();

        this._container.bind<SearchHistoryService>(InjectionTokens.SEARCH_HISTORY_SERVICE).to(SearchHistoryServiceImpl).inSingletonScope();

        this.apiService.setDefaultApiAuthenticators([
            new ApiAuthenticator(this.sharedPreferences, this.sdkConfig.httpConfig, this.deviceInfo, this.apiService)
        ]);

        this.apiService.setDefaultSessionAuthenticators([
            new SessionAuthenticator(this.sharedPreferences, this.sdkConfig.httpConfig, this.apiService, this.authService)
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

                if (key === 'fcmToken') {
                    this.telemetryService.resetDeviceRegisterTTL();
                }
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
        return this.frameworkService.preInit()
            .concatMap(() => this.profileService.preInit());
    }

    private postInit() {
        return Observable.combineLatest(
            this.apiService.onInit(),
            this.summarizerService.onInit(),
            this.errorLoggerService.onInit(),
            this.eventsBusService.onInit(),
            this.downloadService.onInit(),
            this.contentService.onInit(),
            this.storageService.onInit()
        );
    }
}
