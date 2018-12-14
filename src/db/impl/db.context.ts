import { DBMigration } from "../def/db.migration";

export abstract class DBContext {

    abstract getDBName(): string
    abstract getDBVersion(): number
    abstract getAppMigrationList(): Array<DBMigration>
}