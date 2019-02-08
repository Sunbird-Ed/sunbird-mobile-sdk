import {DbConfig, DbService, DeleteQuery, InsertQuery, Migration, ReadQuery, UpdateQuery} from '..';
import {Observable, Subject} from 'rxjs';
import {InitialMigration} from '../migrations/initial-migration';
import {QueryBuilder} from '../util/query-builder';

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
    constructor(private context: DbConfig,
                private dBVersion: number,
                private appMigrationList: Migration[]
    ) {}


    update(updateQuery: UpdateQuery): Observable<boolean> {
        console.log('updateQuery', updateQuery);
        throw new Error('Method not implemented.');
    }

    public async init(): Promise<undefined> {
        return new Promise<undefined>(((resolve) => {
            db.init(this.context.dbName,
                this.dBVersion,
                [],
                async (value) => {
                    if (value.method === 'onCreate') {
                        await this.onCreate();
                    } else if (value.method === 'onUpgrade') {
                        await this.onUpgrade(value.oldVersion, value.newVersion);
                    }
                });


            this.hasInitialized().subscribe(() => {
                resolve();
            });
        }));
    }

    private hasInitialized(): Observable<undefined> {
        return this.execute('DROP TABLE IF EXISTS dummy_init_table');
    }

    delete(deleteQuery: DeleteQuery): Observable<undefined> {
        const query = `
            DELETE FROM ${deleteQuery.table}
            WHERE ${new QueryBuilder().where(deleteQuery.selection).args(deleteQuery.selectionArgs).end().build()}
        `;

        const observable = new Subject<any>();

        db.execute(query, value => {
            observable.next(value);
            observable.complete();
        }, error => {
            observable.error(error);
        });

        return observable;
    }

    private async onCreate() {
        return new InitialMigration().apply(this);
    }

    private async onUpgrade(oldVersion: number, newVersion: number) {
        this.appMigrationList.forEach(async (migration) => {
            if (migration.required(oldVersion, newVersion)) {
                await migration.apply(this);
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
        console.log('read query', readQuery);
        const observable = new Subject<any[]>();

        db.read(!!readQuery.distinct,
            readQuery.table,
            readQuery.columns || [],
            readQuery.selection || '',
            readQuery.selectionArgs || [],
            readQuery.groupBy || '',
            readQuery.having || '',
            readQuery.orderBy || '',
            readQuery.limit || '',
            (json: any[]) => {
                console.log('db read sucess', json);
                observable.next(json);
                observable.complete();
            }, (error: string) => {
                console.log('db.read err', error);
                observable.error(error);
            });

        return observable;
    }

    insert(inserQuery: InsertQuery): Observable<number> {
        console.log('insert query', inserQuery);
        const observable = new Subject<number>();

        db.insert(inserQuery.table,
            inserQuery.modelJson, (number: number) => {
                console.log('insert success', number);
                observable.next(number);
                observable.complete();
            }, (error: string) => {
                console.log('insert err', error);
                observable.error(error);
            });

        return observable;
    }

    beginTransaction(): void {
        db.beginTransaction();
    }

    endTransaction(isOperationSuccessful: boolean): void {
        db.endTransaction(isOperationSuccessful);
    }

}
