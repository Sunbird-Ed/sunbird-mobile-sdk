import {Environments} from './environments';
import {HttpConfig} from '../native/http';
import {DbConfig} from '../native/db';
import {ContentServiceConfig} from '../services/content';
import {CourseServiceConfig} from '../services/course';
import {FormServiceConfig} from '../services/form';
import {FrameworkServiceConfig} from '../services/framework';
import {ProfileServiceConfig} from '../services/profile';
import {PageServiceConfig} from '../services/page';
import {AppConfig} from '../native/http/config/app-config';
import {SystemSettingsConfig} from '../services/system-settings';
import {TelemetryConfig} from '../services/telemetry/config/telemetry-config';
import {PlayerConfig} from '../services/player/def/response';
import {EventsBusConfig} from '../services/events-bus/config/events-bus-config';
import {ErrorLoggerConfig} from '../services/error-stack/config/error-logger-config';
import {BootstrapConfig} from './bootstrap-config';

export interface SdkConfig {
    environment: Environments;
    bootstrapConfig: BootstrapConfig;
    httpConfig: HttpConfig;
    dbConfig: DbConfig;
    contentServiceConfig: ContentServiceConfig;
    courseServiceConfig: CourseServiceConfig;
    formServiceConfig: FormServiceConfig;
    frameworkServiceConfig: FrameworkServiceConfig;
    profileServiceConfig: ProfileServiceConfig;
    pageServiceConfig: PageServiceConfig;
    appConfig: AppConfig;
    systemSettingsConfig: SystemSettingsConfig;
    telemetryConfig: TelemetryConfig;
    playerConfig?: PlayerConfig;
    eventsBusConfig: EventsBusConfig;
    errorLoggerConfig: ErrorLoggerConfig;
}
