import {Migration} from "../def/migration";

export abstract class DbConfig {

    abstract getDBName(): string
    abstract getDBVersion(): number
    abstract getAppMigrationList(): Array<Migration>
}