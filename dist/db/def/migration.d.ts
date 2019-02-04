import { DbService } from './db-service';
export declare abstract class Migration {
    targetDbVersion: number;
    migrationNumber: number;
    constructor(migrationNumber: number, targetDbVersion: number);
    abstract apply(dbService: DbService): any;
    abstract queries(): Array<string>;
    required(oldVersion: number, newVersion: number): boolean;
}
