import { Migration } from "./migration";

export abstract class Context {

    abstract getDBName(): string
    abstract getDBVersion(): number
    abstract getAppMigrationList(): Array<Migration>
}