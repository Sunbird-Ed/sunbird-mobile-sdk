import {ApiConfig} from './api';
import {DbConfig} from './db';
import {ContentServiceConfig} from './content';
import {CourseServiceConfig} from './course';
import {FormServiceConfig} from './form';
import {FrameworkServiceConfig} from './framework';
import {ProfileServiceConfig} from './profile';
import {PageServiceConfig} from './page';
import {AppConfig} from './api/config/app-config';
import {FileConfig} from './util/file/config/file-config';
import {SystemSettingsConfig} from './system-settings';
import {TelemetryConfig} from './telemetry/config/telemetry-config';
import {SharedPreferencesConfig} from './util/shared-preferences';
import {PlayerConfig} from './player/def/response';
import {EventsBusConfig} from './events-bus/config/events-bus-config';
import {ErrorLoggerConfig} from './util/error-stack/config/error-logger-config';
import {FaqServiceConfig} from './faq';

export interface SdkConfig {
    apiConfig: ApiConfig;
    dbConfig: DbConfig;
    fileConfig: FileConfig;
    contentServiceConfig: ContentServiceConfig;
    courseServiceConfig: CourseServiceConfig;
    formServiceConfig: FormServiceConfig;
    frameworkServiceConfig: FrameworkServiceConfig;
    faqServiceConfig: FaqServiceConfig;
    profileServiceConfig: ProfileServiceConfig;
    pageServiceConfig: PageServiceConfig;
    appConfig: AppConfig;
    systemSettingsConfig: SystemSettingsConfig;
    telemetryConfig: TelemetryConfig;
    sharedPreferencesConfig: SharedPreferencesConfig;
    playerConfig?: PlayerConfig;
    eventsBusConfig: EventsBusConfig;
    errorLoggerConfig: ErrorLoggerConfig;
}
