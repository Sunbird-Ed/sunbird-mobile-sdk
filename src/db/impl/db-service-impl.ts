import {DbService} from "..";
import {InsertQuery, ReadQuery, UpdateQuery} from "..";
import {DbConfig} from '..';

declare var db: {
    init: (dbName, dbVersion, migrations, callback) => void,
    read: (distinct: boolean,
           table: string,
           columns: Array<string>,
           selection: string,
           selectionArgs: Array<string>,
           groupBy: string,
           having: string,
           orderBy: string,
           limit: string,
           success,
           error) => void,
    execute: (query: string, success, error) => void,
    insert: (table: string, model: string, success, error) => void,
    beginTransaction: () => void,
    endTransaction: (isOperationSuccessful: boolean) => void
};

export class DbServiceImpl implements DbService {

    private context: DbConfig;
    private initialized: boolean = false;

    constructor(context: DbConfig) {
        this.context = context;
    }

    private init() {
        this.initialized = true;

        db.init(this.context.getDBName(),
            this.context.getDBVersion(),
            this.prepareMigrationList(),
            value => {
                if (value.method === "onCreate") {
                    this.onCreate();
                } else if (value.method === "onUpgrade") {
                    this.onUpgrade(value.oldVersion, value.newVersion);
                }
            });
    }

    private prepareMigrationList(): any {
        let migrationList = this.context.getAppMigrationList();
        let migrations: Array<any> = [];
        migrationList.forEach(migration => {
            let m = {};
            m["targetDbVersion"] = migration.targetDbVersion;
            m["queryList"] = migration.queries();
            migrations.push(m);
        });
        return migrations;
    }

    private onCreate() {

    }

    private onUpgrade(oldVersion: number, newVersion: number) {

    }

    execute(query: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            db.execute(query, value => {
                resolve(value);
            }, error => {
                reject(error);
            });
        });
    }

    read(readQuery: ReadQuery): Promise<any[]> {

        if (!this.initialized) {
            this.init();
        }
        return new Promise<any[]>((resolve, reject) => {
            db.read(readQuery.distinct!!,
                readQuery.table,
                readQuery.columns!!,
                readQuery.selection!!,
                readQuery.selectionArgs!!,
                readQuery.groupBy!!,
                readQuery.having!!,
                readQuery.orderBy!!,
                readQuery.limit!!, (json: any[]) => {
                    resolve(json);
                }, (error: string) => {
                    reject(error);
                });
        });
    }

    insert(inserQuery: InsertQuery): Promise<number> {
        if (!this.initialized) {
            this.init();
        }

        return new Promise<number>((resolve, reject) => {
            db.insert(inserQuery.table,
                inserQuery.modelJson, (number: number) => {
                    resolve(number);
                }, (error: string) => {
                    reject(error);
                });
        });
    }

    update(updateQuery: UpdateQuery): Promise<boolean> {
        throw new Error("Method not implemented.");
    }


    delete(table: string, whereClause: string, whereArgs: string[]): Promise<number> {
        // TODO
        throw new Error('Method not implemented.');
    }

    beginTransaction(): void {
       db.beginTransaction();
    }

    endTransaction(isOperationSuccessful: boolean): void {
        db.endTransaction(isOperationSuccessful);
    }


}