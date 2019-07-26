import {DbConfig, DbService, DeleteQuery, InsertQuery, Migration, ReadQuery, UpdateQuery} from '..';
import {Observable, Subject} from 'rxjs';
import {InitialMigration} from '../migrations/initial-migration';
import {QueryBuilder} from '../util/query-builder';
import {injectable, inject} from 'inversify';
import {SdkConfig} from '../../sdk-config';
import {InjectionTokens} from '../../injection-tokens';

@injectable()
export class DbCordovaService implements DbService {
    private context: DbConfig;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
                @inject(InjectionTokens.DB_VERSION) private dBVersion: number,
                @inject(InjectionTokens.DB_MIGRATION_LIST) private appMigrationList: Migration[]
    ) {
        this.context = this.sdkConfig.dbConfig;
    }


    update(updateQuery: UpdateQuery): Observable<number> {
        const observable = new Subject<any>();

        db.update(updateQuery.table,
            updateQuery.selection || '',
            updateQuery.selectionArgs || [],
            updateQuery.modelJson,
            updateQuery.useExternalDb || false,
            (count: any) => {
                observable.next(count);
                observable.complete();
            }, (error: string) => {
                observable.error(error);
            });

        return observable;
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

        db.execute(query, deleteQuery.useExternalDb || false, value => {
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

    execute(query: string, useExternalDb?: boolean): Observable<any> {
        const observable = new Subject<any>();

        db.execute(query, useExternalDb || false, (value) => {
            observable.next(value);
            observable.complete();
        }, error => {
            observable.error(error);
        });

        return observable;
    }

    read(readQuery: ReadQuery): Observable<any[]> {
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
            readQuery.useExternalDb || false,
            (json: any[]) => {
                observable.next(json);
                observable.complete();
            }, (error: string) => {
                observable.error(error);
            });

        return observable;
    }

    insert(inserQuery: InsertQuery): Observable<number> {
        const observable = new Subject<number>();

        db.insert(inserQuery.table,
            inserQuery.modelJson, inserQuery.useExternalDb || false, (number: number) => {
                observable.next(number);
                observable.complete();
            }, (error: string) => {
                observable.error(error);
            });

        return observable;
    }

    beginTransaction(): void {
        db.beginTransaction();
    }

    endTransaction(isOperationSuccessful: boolean, useExternalDb?: boolean): void {
        db.endTransaction(isOperationSuccessful, useExternalDb || false);
    }

    copyDatabase(destination: string): Observable<boolean> {
        const observable = new Subject<boolean>();

        db.copyDatabase(destination, (success: boolean) => {
            observable.next(success);
            observable.complete();
        }, (error: string) => {
            observable.error(error);
        });

        return observable;
    }

    open(dbFilePath: string): Promise<undefined> {
        return new Promise<undefined>(((resolve, reject) => {
            db.open(dbFilePath,
                (value) => {
                    resolve();
                }, (value) => {
                    reject();
                });
        }));
    }

}
