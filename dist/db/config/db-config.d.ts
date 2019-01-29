import { Migration } from '../def/migration';
export interface DbConfig {
    getDBName(): string;
    getDBVersion(): number;
    getAppMigrationList(): Array<Migration>;
}
