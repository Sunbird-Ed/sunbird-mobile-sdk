import { DbConfig, DbService, DeleteQuery, InsertQuery, Migration, ReadQuery, UpdateQuery } from '..';
import { Observable } from 'rxjs';
export declare class DbWebSqlService implements DbService {
    private context;
    private dBVersion;
    private appMigrationList;
    webSqlDB: any;
    constructor(context: DbConfig, dBVersion: number, appMigrationList: Migration[]);
    init(): Promise<undefined>;
    read(readQuery: ReadQuery): Observable<any[]>;
    insert(inserQuery: InsertQuery): Observable<number>;
    execute(query: string): Observable<any>;
    update(updateQuery: UpdateQuery): Observable<boolean>;
    delete(deleteQuery: DeleteQuery): Observable<undefined>;
    beginTransaction(): void;
    endTransaction(isOperationSuccessful: boolean): void;
    private hasInitialized;
    private onCreate;
}
