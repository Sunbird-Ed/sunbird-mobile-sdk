import { DbConfig, DbService, DeleteQuery, InsertQuery, Migration, ReadQuery, UpdateQuery } from '..';
import { Observable, Subject } from 'rxjs';
import * as squel from 'squel';




export class DbServiceWebSql implements DbService {

    webSqlDB: any;
    private initialized = false;

    constructor(private context: DbConfig,
        private dBVersion: number,
        private appMigrationList: Migration[],
    ) {
    }

    update(updateQuery: UpdateQuery): Observable<boolean> {
        throw new Error('Method not implemented.');
    }

    public init() {
        this.initialized = true;
        this.webSqlDB = window.openDatabase('this.context.dbName', 'this.dBVersion', 'Genie web sql DB', 2 * 1024 * 1024);
    }

    private onCreate() {

    }

    private onUpgrade(oldVersion: number, newVersion: number) {

    }

    execute(query: string): Observable<any> {
        const observable = new Subject<any>();

        // db.execute(query, value => {
        //     observable.next(value);
        //     observable.complete();
        // }, error => {
        //     observable.error(error);
        // });

        this.webSqlDB.transaction((tx) => {
            tx.executeSql(query,
                [], (sqlTransaction, sqlResultSet) => {
                    observable.next(sqlResultSet);
                    observable.complete();
                }, (sqlTransaction, sqlError) => {
                    observable.error(sqlError);
                });
        });

        return observable;
    }

    read(readQuery: ReadQuery): Observable<any[]> {

        if (!this.initialized) {
            this.init();
        }

        const observable = new Subject<any[]>();

        // db.read(readQuery.distinct!!,
        //     readQuery.table,
        //     readQuery.columns!,
        //     readQuery.selection!,
        //     readQuery.selectionArgs!,
        //     readQuery.groupBy!,
        //     readQuery.having!!,
        //     readQuery.orderBy!!,
        //     readQuery.limit!! + '', (json: any[]) => {
        //         observable.next(json);
        //         observable.complete();
        //     }, (error: string) => {
        //         observable.error(error);
        //     });

        const attachFields = (mixin, fields: string[] = []) => {
            fields.forEach((field) => {
                mixin.field(field);
            });

            return mixin;
        };

        const query = squel.select()
            .from(readQuery.table);

        attachFields(query, readQuery.columns);
        if (readQuery.groupBy) {
            query.group(readQuery.groupBy);
        }
        // need to check syntax
        if (readQuery.having) {
            query.having(readQuery.having);
        }
        if (readQuery.distinct) {
            query.distinct();
        }
        if (readQuery.orderBy) {
            query.order(readQuery.orderBy);
        }
        if (readQuery.limit) {
            query.limit(parseInt(readQuery.limit, 10));
        }
        if (readQuery.selection && readQuery.selectionArgs) {
            query.where(readQuery.selection, ...readQuery.selectionArgs);
        }
        query.toString();

        this.webSqlDB.
            this.webSqlDB.transaction((tx) => {
                tx.executeSql(query,
                    [], (sqlTransaction, sqlResultSet) => {
                        observable.next(sqlResultSet);
                        observable.complete();
                    }, (sqlTransaction, sqlError) => {
                        observable.error(sqlError);
                    });
            });

        return observable;
    }

    insert(inserQuery: InsertQuery): Observable<number> {
        if (!this.initialized) {
            this.init();
        }

        const observable = new Subject<number>();

        // db.insert(inserQuery.table,
        //     inserQuery.modelJson, (number: number) => {
        //         observable.next(number);
        //         observable.complete();
        //     }, (error: string) => {
        //         observable.error(error);
        //     });

        const query = squel.insert()
            .into(inserQuery.table)
            .setFields(inserQuery.modelJson)
            .toString();

        this.webSqlDB.
            this.webSqlDB.transaction((tx) => {
                tx.executeSql(query,
                    [], (sqlTransaction, sqlResultSet) => {
                        observable.next(sqlResultSet);
                        observable.complete();
                    }, (sqlTransaction, sqlError) => {
                        observable.error(sqlError);
                    });
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
        // db.beginTransaction();
        throw new Error('Method not implemented.');
    }

    endTransaction(isOperationSuccessful: boolean): void {
        // db.endTransaction(isOperationSuccessful);
        throw new Error('Method not implemented.');
    }

}
