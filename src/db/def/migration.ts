import {DbService} from './db-service';
export type MigrationFactory = () => Migration;

export abstract class Migration {

    targetDbVersion: number;
    migrationNumber: number;

    protected constructor(migrationNumber: number, targetDbVersion: number) {
        this.targetDbVersion = targetDbVersion;
        this.migrationNumber = migrationNumber;
    }

    abstract apply(dbService: DbService): Promise<undefined>;
    abstract queries(): Array<string>;

    required(oldVersion: number, newVersion: number): boolean {
        return oldVersion < this.targetDbVersion && this.targetDbVersion <= newVersion;
    }

}
