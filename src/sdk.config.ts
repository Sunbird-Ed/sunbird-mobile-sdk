import {ApiConfig} from "./net";
import {DbConfig} from "./db";

export type SdkConfig = {
    apiConfig: ApiConfig,
    dbContext: DbConfig
}