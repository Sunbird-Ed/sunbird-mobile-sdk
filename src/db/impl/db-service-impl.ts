import {DbConfig, DbService, InsertQuery, ReadQuery, UpdateQuery} from '..';
import {Observable, Subject} from 'rxjs';

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
    private initialized = false;

    constructor(context: DbConfig) {
        this.context = context;
    }

    update(updateQuery: UpdateQuery): Observable<boolean> {
        throw new Error('Method not implemented.');
    }

    private init() {
        this.initialized = true;

        db.init(this.context.getDBName(),
            this.context.getDBVersion(),
            this.prepareMigrationList(),
            value => {
                if (value.method === 'onCreate') {
                    this.onCreate();
                } else if (value.method === 'onUpgrade') {
                    this.onUpgrade(value.oldVersion, value.newVersion);
                }
            });
    }

    private onCreate() {

    }

    private onUpgrade(oldVersion: number, newVersion: number) {

    }

    execute(query: string): Observable<any> {

        const observable = new Subject<any>();

        db.execute(query, value => {
            observable.next(value);
            observable.complete();
        }, error => {
            observable.error(error);
        });

        return observable;
    }

    read(readQuery: ReadQuery): Observable<any[]> {

        if (!this.initialized) {
            this.init();
        }

        const observable = new Subject<any[]>();

        db.read(readQuery.distinct!!,
            readQuery.table,
            readQuery.columns!!,
            readQuery.selection!!,
            readQuery.selectionArgs!!,
            readQuery.groupBy!!,
            readQuery.having!!,
            readQuery.orderBy!!,
            readQuery.limit!!, (json: any[]) => {
                observable.next(json);
                observable.complete();
            }, (error: string) => {
                observable.error(error);
            });

        return observable;
    }

    insert(inserQuery: InsertQuery): Observable<number> {
        if (!this.initialized) {
            this.init();
        }

        const observable = new Subject<number>();

        db.insert(inserQuery.table,
            inserQuery.modelJson, (number: number) => {
                observable.next(number);
                observable.complete();
            }, (error: string) => {
                observable.error(error);
            });

        return observable;
    }

    private prepareMigrationList(): any {
        const migrationList = this.context.getAppMigrationList();
        const migrations: Array<any> = [];
        migrationList.forEach(migration => {
            const m = {};
            m['targetDbVersion'] = migration.targetDbVersion;
            m['queryList'] = migration.queries();
            migrations.push(m);
        });
        return migrations;
    }


    delete(table: string, whereClause: string, whereArgs: string[]): Observable<number> {
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
