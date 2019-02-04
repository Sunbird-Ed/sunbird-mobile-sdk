import {ApiConfig} from './api';
import {DbConfig} from './db';
import {ContentServiceConfig} from './content';
import {CourseServiceConfig} from './course';
import {FormServiceConfig} from './form';
import {FrameworkServiceConfig} from './framework';
import {ProfileServiceConfig} from './profile';
import {PageServiceConfig} from './page/config/page-service-config';
import {AppConfig} from './api/config/app-config';

export interface SdkConfig {
    apiConfig: ApiConfig;
    dbConfig: DbConfig;
    contentServiceConfig: ContentServiceConfig;
    courseServiceConfig: CourseServiceConfig;
    formServiceConfig: FormServiceConfig;
    frameworkServiceConfig: FrameworkServiceConfig;
    profileServiceConfig: ProfileServiceConfig;
    pageServiceConfig: PageServiceConfig;
    appConfig: AppConfig;
}
