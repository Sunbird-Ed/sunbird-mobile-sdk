import {DbConfig, DbService, DeleteQuery, InsertQuery, Migration, ReadQuery, UpdateQuery} from '..';
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

export class DbCordovaService implements DbService {

    private initialized = false;

    constructor(private context: DbConfig,
                private dBVersion: number,
                private appMigrationList: Migration[]
    ) {
        this.init();
    }

    update(updateQuery: UpdateQuery): Observable<boolean> {
        throw new Error('Method not implemented.');
    }

    public init() {
        this.initialized = true;
        db.init(this.context.dbName,
            this.dBVersion,
            [],
            value => {
                if (value.method === 'onCreate') {
                    this.onCreate();
                } else if (value.method === 'onUpgrade') {
                    this.onUpgrade(value.oldVersion, value.newVersion);
                }
            });
    }

    private onCreate() {
        console.log('onCreate');
        this.appMigrationList.forEach( (migration) => {
          migration.apply(this);
        });

    }

    private onUpgrade(oldVersion: number, newVersion: number) {
        console.log('onUpgrade');
        this.appMigrationList.forEach( (migration) => {
            if (migration.required(oldVersion, newVersion)) {
                migration.apply(this);
            }

        });
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
            readQuery.limit!! + '', (json: any[]) => {
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
        const migrationList = this.appMigrationList;
        const migrations: Array<any> = [];
        migrationList.forEach(migration => {
            const m = {};
            m['targetDbVersion'] = migration.targetDbVersion;
            m['queryList'] = migration.queries();
            migrations.push(m);
        });
        return migrations;
    }


    delete(deleteQuery: DeleteQuery): Observable<number> {
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
