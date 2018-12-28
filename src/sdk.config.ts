import {ApiConfig} from "./api";
import {DbConfig} from "./db";

export type SdkConfig = {
    apiConfig: ApiConfig,
    dbContext: DbConfig
}