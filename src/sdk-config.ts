import {ApiConfig} from './api';
import {DbConfig} from './db';

export interface SdkConfig {
    apiConfig: ApiConfig;
    dbContext: DbConfig;
}
