import {ApiConfig} from './native/http';
import {DbConfig} from './native/db';
import {ContentServiceConfig} from './services/content';
import {CourseServiceConfig} from './services/course';
import {FormServiceConfig} from './services/form';
import {FrameworkServiceConfig} from './services/framework';
import {ProfileServiceConfig} from './services/profile';
import {PageServiceConfig} from './services/page';
import {AppConfig} from './native/http/config/app-config';
import {FileConfig} from './native/file/config/file-config';
import {SystemSettingsConfig} from './services/system-settings';
import {TelemetryConfig} from './services/telemetry/config/telemetry-config';
import {SharedPreferencesConfig} from './native/shared-preferences';
import {PlayerConfig} from './services/player/def/response';
import {EventsBusConfig} from './services/events-bus/config/events-bus-config';
import {ErrorLoggerConfig} from './services/error-stack/config/error-logger-config';

export interface SdkConfig {
    apiConfig: ApiConfig;
    dbConfig: DbConfig;
    fileConfig: FileConfig;
    contentServiceConfig: ContentServiceConfig;
    courseServiceConfig: CourseServiceConfig;
    formServiceConfig: FormServiceConfig;
    frameworkServiceConfig: FrameworkServiceConfig;
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
