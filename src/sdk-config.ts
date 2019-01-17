import {ApiConfig} from './api';
import {DbConfig} from './db';
import {ContentServiceConfig} from './content/config/content-config';
import {CourseServiceConfig} from './course';
import {FormServiceConfig} from './form/config/form-service-config';
import {FrameworkServiceConfig} from './framework';

export interface SdkConfig {
    apiConfig: ApiConfig;
    dbContext: DbConfig;
    contentServiceConfig: ContentServiceConfig;
    courseServiceConfig: CourseServiceConfig;
    formServiceConfig: FormServiceConfig;
    frameworkServiceConfig: FrameworkServiceConfig;
}
