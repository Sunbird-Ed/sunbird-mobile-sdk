import {ApiService, ApiServiceImpl} from './api';
import {DbService, Migration, MigrationFactory} from './db';
import {AuthService} from './auth';
import {TelemetryDecorator, TelemetryService} from './telemetry';
import {SharedPreferences} from './util/shared-preferences';
import {SdkConfig} from './sdk-config';
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
import {ProfileSyllabusMigration} from './db/migrations/profile-syllabus-migration';
import {GroupProfileMigration} from './db/migrations/group-profile-migration';
import {MillisecondsToSecondsMigration} from './db/migrations/milliseconds-to-seconds-migration';
import {ErrorStackMigration} from './db/migrations/error-stack-migration';
import {FrameworkMigration} from './db/migrations/framework-migration';
import {ContentMarkerMigration} from './db/migrations/content-marker-migration';
import {SystemSettingsService, SystemSettingsServiceImpl} from './system-settings';
import {ZipService} from './util/zip/def/zip-service';
import {DeviceInfo} from './util/device';
import {ZipServiceImpl} from './util/zip/impl/zip-service-impl';
import {DeviceInfoImpl} from './util/device/impl/device-info-impl';
import {ContentFeedbackServiceImpl} from './content/impl/content-feedback-service-impl';
import {EventsBusService} from './events-bus';
import {EventsBusServiceImpl} from './events-bus/impl/events-bus-service-impl';
import {SummarizerService, SummarizerServiceImpl} from './summarizer';
import {DownloadService} from './util/download';
import {DownloadServiceImpl} from './util/download/impl/download-service-impl';
import {AppInfo} from './util/app';
import {AppInfoImpl} from './util/app/impl/app-info-impl';
import {PlayerService, PlayerServiceImpl} from './player';
import {TelemetryConfig} from './telemetry/config/telemetry-config';
import {OfflineSearchTextbookMigration} from './db/migrations/offline-search-textbook-migration';
import {Container} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from './injection-tokens';
import {StorageService} from './storage';
import {StorageServiceImpl} from './storage/impl/storage-service-impl';
import {NotificationService} from './notification';
import {NotificationServiceImpl} from './notification/impl/notification-service-impl';
import {ErrorLoggerService} from './error';
import {ErrorLoggerServiceImpl} from './error/impl/error-logger-service-impl';
import {NetworkInfoService} from './util/network';
import {NetworkInfoServiceImpl} from './util/network/impl/network-info-service-impl';
import {SearchHistoryMigration} from './db/migrations/search-history-migration';
import {SearchHistoryService} from './util/search-history';
import {SearchHistoryServiceImpl} from './util/search-history/impl/search-history-service-impl';
import {RecentlyViewedMigration} from './db/migrations/recently-viewed-migration';
import {CourseAssessmentMigration} from './db/migrations/course-assessment-migration';
import {CodePushExperimentService, CodePUshExperimentServiceImpl} from './codepush-experiment';
import {FaqService, FaqServiceImpl} from './faq';
import {DeviceRegisterConfig, DeviceRegisterService, DeviceRegisterServiceImpl} from './device-register';
import {combineLatest} from 'rxjs';
import {concatMap} from 'rxjs/operators';
import {ArchiveService} from './archive';
import {ArchiveServiceImpl} from './archive/impl/archive-service-impl';
import {NetworkQueueMigration} from './db/migrations/network-queue-migration';
import {NetworkQueueImpl} from './api/network-queue/impl/network-queue-impl';
import {NetworkQueue} from './api/network-queue';
import {CsModule} from '@project-sunbird/client-services';
import {CsHttpService} from '@project-sunbird/client-services/core/http-service';
import * as SHA1 from 'crypto-js/sha1';
import {CsGroupService} from '@project-sunbird/client-services/services/group';
import {CsCourseService} from '@project-sunbird/client-services/services/course';
import {GroupService} from './group';
import {GroupServiceImpl} from './group/impl/group-service-impl';
import {GroupServiceDeprecated} from './group-deprecated';
import {GroupServiceDeprecatedImpl} from './group-deprecated/impl/group-service-deprecated-impl';
import {CsUserService} from '@project-sunbird/client-services/services/user';
import {ContentGeneralizationMigration} from './db/migrations/content-generalization-migration';
import {CsClientStorage} from '@project-sunbird/client-services/core';
import { DiscussionService } from './discussion';
import { DiscussionServiceImpl } from './discussion/impl/discussion-service.impl';
import { CsDiscussionService } from '@project-sunbird/client-services/services/discussion';
import { CsContentService } from '@project-sunbird/client-services/services/content';
import { SegmentationService, SegmentationServiceImpl } from './segmentation';
import { DebuggingService, DebuggingServiceImpl } from './debugging';
import { NotificationServiceV2Impl } from './notification-v2/impl/notification-service-v2-impl';
import { NotificationServiceV2 } from './notification-v2/def/notification-service-v2';
import { CsNotificationService } from '@project-sunbird/client-services/services/notification/interface/cs-notification-service';
import {PlayerConfigDataMigrations} from './db/migrations/player-config-data-migrations';
import { CertificatePublicKeyMigration } from './db/migrations/certificate-public-key-migration';
import { CsCertificateService } from '@project-sunbird/client-services/services/certificate';
import { CertificateService, CertificateServiceImpl } from './certificate';
import { CsFrameworkService } from '@project-sunbird/client-services/services/framework/interface';

export class SunbirdSdk {
    private _container: Container;

    private static _instance?: SunbirdSdk;

    public static get instance(): SunbirdSdk {
        if (!SunbirdSdk._instance) {
            SunbirdSdk._instance = new SunbirdSdk();
        }

        return SunbirdSdk._instance;
    }

    private _isInitialised: boolean = false;

    get isInitialised(): boolean {
        return this._isInitialised;
    }

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

    get groupServiceDeprecated(): GroupServiceDeprecated {
        return this._container.get<GroupServiceDeprecated>(InjectionTokens.GROUP_SERVICE_DEPRECATED);
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

    get codePushExperimentService(): CodePushExperimentService {
        return this._container.get<CodePushExperimentService>(InjectionTokens.CODEPUSH_EXPERIMENT_SERVICE);
    }

    get faqService(): FaqService {
        return this._container.get<FaqService>(InjectionTokens.FAQ_SERVICE);
    }

    get deviceRegisterService(): DeviceRegisterService {
        return this._container.get<DeviceRegisterService>(InjectionTokens.DEVICE_REGISTER_SERVICE);
    }

    get archiveService(): ArchiveService {
        return this._container.get<ArchiveService>(InjectionTokens.ARCHIVE_SERVICE);
    }

    get networkQueueService(): NetworkQueue {
        return this._container.get<NetworkQueue>(InjectionTokens.NETWORK_QUEUE);
    }

    get discussionService(): DiscussionService {
        return this._container.get<DiscussionService>(InjectionTokens.DISCUSSION_SERVICE);
    }

    get segmentationService(): SegmentationService {
        return this._container.get<SegmentationService>(InjectionTokens.SEGMENTATION_SERVICE);
    }

    get debuggingService(): DebuggingService {
        return this._container.get<DebuggingService>(InjectionTokens.DEBUGGING_SERVICE);
    }

    get notificationServiceV2(): NotificationServiceV2 {
        return this._container.get<NotificationServiceV2>(InjectionTokens.NOTIFICATION_SERVICE_V2);
    }

    get certificateService(): CertificateService {
        return this._container.get<CertificateService>(InjectionTokens.CERTIFICATE_SERVICE);
    }

    public async init(sdkConfig: SdkConfig) {
        this._container = new Container();

        this._container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(this._container);

        this._container.bind<number>(InjectionTokens.DB_VERSION).toConstantValue(31);

        this._container.bind<(Migration | MigrationFactory)[]>(InjectionTokens.DB_MIGRATION_LIST).toConstantValue([
            new ProfileSyllabusMigration(),
            new GroupProfileMigration(),
            new MillisecondsToSecondsMigration(),
            new ContentMarkerMigration(),
            new OfflineSearchTextbookMigration(),
            new ErrorStackMigration(),
            new SearchHistoryMigration(),
            new RecentlyViewedMigration(),
            new CourseAssessmentMigration(),
            () => {
                return new NetworkQueueMigration(
                    sdkConfig, this._container.get<NetworkQueue>(InjectionTokens.NETWORK_QUEUE)
                );
            },
            new ContentGeneralizationMigration(),
            new PlayerConfigDataMigrations(),
            new CertificatePublicKeyMigration(),
            new FrameworkMigration()
        ]);

        switch (sdkConfig.platform) {
            case 'cordova':
                this._container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES)
                    .to(SharedPreferencesAndroid).inSingletonScope();
                break;
            case 'web':
                this._container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES)
                    .to(SharedPreferencesLocalStorage).inSingletonScope();
                break;
            default:
                throw new Error('FATAL_ERROR: Invalid platform');
        }

        this._container.bind<DbService>(InjectionTokens.DB_SERVICE).to(DbCordovaService).inSingletonScope();

        this._container.bind<FileService>(InjectionTokens.FILE_SERVICE).to(FileServiceImpl).inSingletonScope();

        this._container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(sdkConfig);

        this._container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).to(DeviceInfoImpl).inSingletonScope();

        this._container.bind<EventsBusService>(InjectionTokens.EVENTS_BUS_SERVICE).to(EventsBusServiceImpl).inSingletonScope();

        this._container.bind<AppInfo>(InjectionTokens.APP_INFO).to(AppInfoImpl).inSingletonScope();

        this._container.bind<ApiService>(InjectionTokens.API_SERVICE).to(ApiServiceImpl).inSingletonScope();

        this._container.bind<AuthService>(InjectionTokens.AUTH_SERVICE).to(AuthServiceImpl).inSingletonScope();

        this._container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).to(KeyValueStoreImpl).inSingletonScope();

        this._container.bind<SystemSettingsService>(InjectionTokens.SYSTEM_SETTINGS_SERVICE)
            .to(SystemSettingsServiceImpl).inSingletonScope();

        this._container.bind<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE).to(FrameworkServiceImpl).inSingletonScope();

        this._container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).to(ProfileServiceImpl).inSingletonScope();

        this._container.bind<GroupService>(InjectionTokens.GROUP_SERVICE).to(GroupServiceImpl).inSingletonScope();

        this._container.bind<GroupServiceDeprecated>(InjectionTokens.GROUP_SERVICE_DEPRECATED).to(GroupServiceDeprecatedImpl).inSingletonScope();

        this._container.bind<ErrorLoggerService>(InjectionTokens.ERROR_LOGGER_SERVICE).to(ErrorLoggerServiceImpl).inSingletonScope();

        this._container.bind<ZipService>(InjectionTokens.ZIP_SERVICE).to(ZipServiceImpl).inSingletonScope();

        this._container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).to(TelemetryServiceImpl).inSingletonScope();

        this._container.bind<ContentFeedbackService>(InjectionTokens.CONTENT_FEEDBACK_SERVICE)
            .to(ContentFeedbackServiceImpl).inSingletonScope();

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

        this._container.bind<CodePushExperimentService>(InjectionTokens.CODEPUSH_EXPERIMENT_SERVICE).to(CodePUshExperimentServiceImpl)
            .inSingletonScope();

        this._container.bind<DeviceRegisterService>(InjectionTokens.DEVICE_REGISTER_SERVICE).to(DeviceRegisterServiceImpl)
            .inSingletonScope();

        this._container.bind<FaqService>(InjectionTokens.FAQ_SERVICE).to(FaqServiceImpl).inSingletonScope();

        this._container.bind<ArchiveService>(InjectionTokens.ARCHIVE_SERVICE).to(ArchiveServiceImpl).inSingletonScope();

        this._container.bind<NetworkQueue>(InjectionTokens.NETWORK_QUEUE).to(NetworkQueueImpl).inSingletonScope();

        this._container.bind<DiscussionService>(InjectionTokens.DISCUSSION_SERVICE).to(DiscussionServiceImpl).inSingletonScope();

        this._container.bind<SegmentationService>(InjectionTokens.SEGMENTATION_SERVICE).to(SegmentationServiceImpl).inSingletonScope();

        this._container.bind<DebuggingService>(InjectionTokens.DEBUGGING_SERVICE).to(DebuggingServiceImpl).inSingletonScope();

        this._container.bind<NotificationServiceV2>(InjectionTokens.NOTIFICATION_SERVICE_V2).to(NotificationServiceV2Impl).inSingletonScope();

        this._container.bind<CertificateService>(InjectionTokens.CERTIFICATE_SERVICE).to(CertificateServiceImpl).inSingletonScope();

        const sharedPreferences = this.sharedPreferences;

        await CsModule.instance.init({
                core: {
                    httpAdapter: sdkConfig.platform === 'web' ? 'HttpClientBrowserAdapter' : 'HttpClientCordovaAdapter',
                    global: {
                        channelId: sdkConfig.apiConfig.api_authentication.channelId,
                        producerId: sdkConfig.apiConfig.api_authentication.producerId,
                        deviceId: SHA1(window.device.uuid).toString()
                    },
                    api: {
                        host: sdkConfig.apiConfig.host,
                        authentication: {}
                    }
                },
                services: {
                    contentServiceConfig: {
                       hierarchyApiPath: '/api/questionset/v2',
                       questionListApiPath: '/api/question/v2'
                    },
                    courseServiceConfig: {
                        apiPath: '/api/course/v1',
                        certRegistrationApiPath: '/api/certreg/v2/certs'
                    },
                    groupServiceConfig: {
                        apiPath: '/api/group/v1',
                        dataApiPath: '/api/data/v1/group',
                        updateGroupGuidelinesApiPath: '/api/group/membership/v1'
                    },
                    userServiceConfig: {
                        apiPath: '/api/user/v2'
                    },
                    formServiceConfig: {
                        apiPath: '/api/data/v1/form'
                    },
                    discussionServiceConfig: {
                        apiPath: '/discussion'
                    },
                    notificationServiceConfig: {
                        apiPath: '/api/notification/v1/feed'
                    },
                    certificateServiceConfig: {
                        apiPath: sdkConfig.certificateServiceConfig.apiPath,
                        apiPathLegacy: sdkConfig.certificateServiceConfig.apiPathLegacy,
                        rcApiPath: sdkConfig.certificateServiceConfig.rcApiPath
                    },
                    frameworkServiceConfig: {
                        apiPath: '/api/framework/v1'
                    },
                }
            }, (() => {
                this._container.rebind<CsHttpService>(CsInjectionTokens.HTTP_SERVICE).toConstantValue(CsModule.instance.httpService);
                this._container.rebind<CsGroupService>(CsInjectionTokens.GROUP_SERVICE).toConstantValue(CsModule.instance.groupService);
                this._container.rebind<CsCourseService>(CsInjectionTokens.COURSE_SERVICE).toConstantValue(CsModule.instance.courseService);
                this._container.rebind<CsUserService>(CsInjectionTokens.USER_SERVICE).toConstantValue(CsModule.instance.userService);
                this._container.rebind<CsDiscussionService>(CsInjectionTokens.DISCUSSION_SERVICE).toConstantValue(CsModule.instance.discussionService);
                this._container.rebind<CsContentService>(CsInjectionTokens.CONTENT_SERVICE).toConstantValue(CsModule.instance.contentService);
                this._container.rebind<CsNotificationService>(CsInjectionTokens.NOTIFICATION_SERVICE_V2).toConstantValue(CsModule.instance.notificationService);
                this._container.rebind<CsCertificateService>(CsInjectionTokens.CERTIFICATE_SERVICE).toConstantValue(CsModule.instance.certificateService);
                this._container.rebind<CsFrameworkService>(CsInjectionTokens.FRAMEWORK_SERVICE).toConstantValue(CsModule.instance.frameworkService);
            }).bind(this),
            new class implements CsClientStorage {

                setItem(key: string, value: string): Promise<void> {
                    return sharedPreferences.putString(key, value).toPromise();
                }

                getItem(key: string): Promise<string | undefined> {
                    return sharedPreferences.getString(key).toPromise();
                }
            });

        this._container.bind<CsHttpService>(CsInjectionTokens.HTTP_SERVICE).toConstantValue(CsModule.instance.httpService);
        this._container.bind<CsGroupService>(CsInjectionTokens.GROUP_SERVICE).toConstantValue(CsModule.instance.groupService);
        this._container.bind<CsCourseService>(CsInjectionTokens.COURSE_SERVICE).toConstantValue(CsModule.instance.courseService);
        this._container.bind<CsUserService>(CsInjectionTokens.USER_SERVICE).toConstantValue(CsModule.instance.userService);
        this._container.bind<CsDiscussionService>(CsInjectionTokens.DISCUSSION_SERVICE).toConstantValue(CsModule.instance.discussionService);
        this._container.bind<CsContentService>(CsInjectionTokens.CONTENT_SERVICE).toConstantValue(CsModule.instance.contentService);
        this._container.bind<CsNotificationService>(CsInjectionTokens.NOTIFICATION_SERVICE_V2).toConstantValue(CsModule.instance.notificationService);
        this._container.bind<CsCertificateService>(CsInjectionTokens.CERTIFICATE_SERVICE).toConstantValue(CsModule.instance.certificateService);
        this._container.bind<CsFrameworkService>(CsInjectionTokens.FRAMEWORK_SERVICE).toConstantValue(CsModule.instance.frameworkService);

        await this.dbService.init();
        await this.appInfo.init();
        await this.preInit().toPromise();
        this._isInitialised = true;

        this.postInit().subscribe();
    }

    public updateTelemetryConfig(update: Partial<TelemetryConfig>) {
        for (const key in update) {
            if (update.hasOwnProperty(key)) {
                this.sdkConfig.telemetryConfig[key] = update[key];
            }
        }
    }

    public updateDeviceRegisterConfig(update: Partial<DeviceRegisterConfig>) {
        for (const key in update) {
            if (update.hasOwnProperty(key)) {
                this.sdkConfig.deviceRegisterConfig[key] = update[key];
                if (key === 'fcmToken') {
                    this.telemetryService.resetDeviceRegisterTTL();
                }
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
        return this.telemetryService.preInit().pipe(
            concatMap(() => this.frameworkService.preInit().pipe(
                concatMap(() => this.profileService.preInit())
            ))
        );
    }

    private postInit() {
        return combineLatest([
            this.apiService.onInit(),
            this.authService.onInit(),
            this.summarizerService.onInit(),
            this.errorLoggerService.onInit(),
            this.eventsBusService.onInit(),
            this.downloadService.onInit(),
            this.contentService.onInit(),
            this.storageService.onInit(),
            this.telemetryService.onInit(),
            this.notificationService.onInit()
        ]);
    }
}
