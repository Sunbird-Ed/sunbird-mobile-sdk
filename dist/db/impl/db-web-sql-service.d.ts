import { DbService, DeleteQuery, InsertQuery, Migration, ReadQuery, UpdateQuery } from '..';
import { Observable } from 'rxjs';
import { SdkConfig } from '../../sdk-config';
export declare class DbWebSqlService implements DbService {
    private sdkConfig;
    private dBVersion;
    private appMigrationList;
    private context;
    webSqlDB: any;
    constructor(sdkConfig: SdkConfig, dBVersion: number, appMigrationList: Migration[]);
    init(): Promise<undefined>;
    read(readQuery: ReadQuery): Observable<any[]>;
    insert(inserQuery: InsertQuery): Observable<number>;
    execute(query: string): Observable<any>;
    update(updateQuery: UpdateQuery): Observable<number>;
    delete(deleteQuery: DeleteQuery): Observable<undefined>;
    beginTransaction(): void;
    endTransaction(isOperationSuccessful: boolean): void;
    private hasInitialized;
    private onCreate;
    copyDatabase(): Observable<boolean>;
    open(dbFilePath: string): Promise<undefined>;
}
