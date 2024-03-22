import {DbConfig, DbService, DeleteQuery, InsertQuery, Migration, MigrationFactory, ReadQuery, UpdateQuery} from '..';
import {InitialMigration} from '../migrations/initial-migration';
import {QueryBuilder} from '../util/query-builder';
import {injectable, inject} from 'inversify';
import {SdkConfig} from '../../sdk-config';
import {InjectionTokens} from '../../injection-tokens';
import {Observable} from 'rxjs';

@injectable()
export class DbCordovaService implements DbService {
    private context: DbConfig;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
                @inject(InjectionTokens.DB_VERSION) private dBVersion: number,
                @inject(InjectionTokens.DB_MIGRATION_LIST) private appMigrationList: (Migration | MigrationFactory)[]
    ) {
        this.context = this.sdkConfig.dbConfig;
    }


    update(updateQuery: UpdateQuery): Observable<number> {
        return new Observable<number>(observer => {
            db.update(updateQuery.table,
                updateQuery.selection || '',
                updateQuery.selectionArgs || [],
                updateQuery.modelJson,
                updateQuery.useExternalDb || false,
                (count: any) => {
                    observer.next(count);
                    observer.complete();
                }, (error: string) => {
                    observer.error(error);
                });
        });
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
                resolve(undefined);
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

        return new Observable<undefined>(observer => {
            db.execute(query, deleteQuery.useExternalDb || false, value => {
                observer.next(value);
                observer.complete();
            }, error => {
                observer.error(error);
            });
        });
    }

    private async onCreate() {
        return new InitialMigration().apply(this);
    }

    private async onUpgrade(oldVersion: number, newVersion: number) {
        for (const m of this.appMigrationList) {
            let migration: Migration;
            if (m instanceof Migration) {
                migration = m;
            } else {
                migration = m();
            }
            console.log('Migration', migration);
            if (migration.required(oldVersion, newVersion)) {
                await migration.apply(this);
            }
        }
    }

    execute(query: string, useExternalDb?: boolean): Observable<any> {
        return new Observable<any>(observer => {
            db.execute(query, useExternalDb || false, (value) => {
                observer.next(value);
                observer.complete();
            }, error => {
                observer.error(error);
            });
        });
    }

    read(readQuery: ReadQuery): Observable<any[]> {
        return new Observable(observer => {
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
                    observer.next(json);
                    observer.complete();
                }, (error: string) => {
                    observer.error(error);
                });
        });
    }

    insert(inserQuery: InsertQuery): Observable<number> {
        return new Observable(observer => {
            db.insert(inserQuery.table,
                inserQuery.modelJson, inserQuery.useExternalDb || false, (number: number) => {
                    observer.next(number);
                    observer.complete();
                }, (error: string) => {
                    observer.error(error);
                });
        });
    }

    beginTransaction(): void {
        db.beginTransaction();
    }

    endTransaction(isOperationSuccessful: boolean, useExternalDb?: boolean): void {
        db.endTransaction(isOperationSuccessful, useExternalDb || false);
    }

    copyDatabase(destination: string): Observable<boolean> {
        return new Observable<boolean>(observer => {
            db.copyDatabase(destination, (success: boolean) => {
                observer.next(success);
                observer.complete();
            }, (error: string) => {
                observer.error(error);
            });
        });
    }

    open(dbFilePath: string): Promise<undefined> {
        return new Promise<undefined>(((resolve, reject) => {
            db.open(dbFilePath,
                (value) => {
                    resolve(value);
                }, (value) => {
                    reject(value);
                });
        }));
    }

}
