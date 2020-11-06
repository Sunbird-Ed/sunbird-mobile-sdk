import {DbConfig, DbService, DeleteQuery, InsertQuery, Migration, ReadQuery, UpdateQuery} from '..';
import {Observable, from, defer} from 'rxjs';
import {InitialMigration} from '../migrations/initial-migration';
import {injectable, inject} from 'inversify';
import {SdkConfig} from '../../sdk-config';
import {InjectionTokens} from '../../injection-tokens';
import * as squel from 'squel';
import alasql from 'alasql';

@injectable()
export class DbInMemorySqlService implements DbService {

    private context: DbConfig;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
                @inject(InjectionTokens.DB_VERSION) private dBVersion: number,
                @inject(InjectionTokens.DB_MIGRATION_LIST) private appMigrationList: Migration[],
    ) {
        this.context = this.sdkConfig.dbConfig;
        window['alasql'] = alasql;
    }

    public async init() {
        await this.onCreate();

        return undefined;
    }

    read(readQuery: ReadQuery): Observable<any[]> {
        return defer(async () => {
            const attachFields = (mixin, fields: string[] = []) => {
                fields.forEach((field) => {
                    mixin.field(field);
                });

                return mixin;
            };

            const query = squel.select({
                autoQuoteFieldNames: false
            }).from(readQuery.table);

            attachFields(query, readQuery.columns);

            if (readQuery.groupBy) {
                query.group(readQuery.groupBy);
            }

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

            console.log(query.toString());

            return alasql.promise(query.toParam().text, query.toParam().values);
        });
    }

    insert(inserQuery: InsertQuery): Observable<number> {
        return defer(async () => {
            const query = squel.insert()
                .into(inserQuery.table)
                .setFields(inserQuery.modelJson);

            console.log(query.toString());

            await alasql.promise(query.toParam().text, query.toParam().values);

            return 1;
        });
    }

    execute(query: string): Observable<any> {
        return defer(async () => {
            console.log(query);

            return alasql.promise(query);
        });
    }

    update(updateQuery: UpdateQuery): Observable<number> {
        return defer(async () => {
            const query = squel.update()
                .table(updateQuery.table);

            if (updateQuery.selection && updateQuery.selectionArgs) {
                query.where(updateQuery.selection, ...updateQuery.selectionArgs);
            }

            const setFields = (mixin, fields: { [key: string]: any }) => {
                Object.keys(fields).forEach((field) => {
                    query.set(field, fields[field]);
                });
            };

            setFields(query, updateQuery.modelJson);

            console.log(query.toString());

            return alasql.promise(query.toParam().text, query.toParam().values);
        });
    }

    delete(deleteQuery: DeleteQuery): Observable<undefined> {
        return defer(async () => {
            const query = squel.delete()
                .from(deleteQuery.table)
                .where(deleteQuery.selection, ...deleteQuery.selectionArgs);

            console.log(query.toString());

            await alasql.promise(query.toParam().text, query.toParam().values);

            return undefined;
        });
    }

    beginTransaction(): void {
        // TODO
    }

    endTransaction(isOperationSuccessful: boolean): void {
        // TODO
    }

    private hasInitialized(): Observable<undefined> {
        return this.execute('DROP TABLE IF EXISTS dummy_init_table');
    }

    private async onCreate() {
        return new InitialMigration().apply(this);
    }

    copyDatabase(): Observable<boolean> {
        throw new Error('Not implemented');
    }

    open(dbFilePath: string): Promise<undefined> {
        throw new Error('Not implemented');
    }


}
