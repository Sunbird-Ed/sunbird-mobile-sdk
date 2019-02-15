import { ApiConfig } from './api';
import { DbConfig } from './db';
import { ContentServiceConfig } from './content';
import { CourseServiceConfig } from './course';
import { FormServiceConfig } from './form';
import { FrameworkServiceConfig } from './framework';
import { ProfileServiceConfig } from './profile';
import { PageServiceConfig } from './page';
import { AppConfig } from './api/config/app-config';
import { FileConfig } from './util/file/config/file-config';
import { SystemSettingsConfig } from './system-settings';
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
}
