import { DbService, DeleteQuery, InsertQuery, Migration, ReadQuery, UpdateQuery } from '..';
import { SdkConfig } from '../../sdk-config';
import { Observable } from 'rxjs';
export declare class DbCordovaService implements DbService {
    private sdkConfig;
    private dBVersion;
    private appMigrationList;
    private context;
    constructor(sdkConfig: SdkConfig, dBVersion: number, appMigrationList: Migration[]);
    update(updateQuery: UpdateQuery): Observable<number>;
    init(): Promise<undefined>;
    private hasInitialized;
    delete(deleteQuery: DeleteQuery): Observable<undefined>;
    private onCreate;
    private onUpgrade;
    execute(query: string, useExternalDb?: boolean): Observable<any>;
    read(readQuery: ReadQuery): Observable<any[]>;
    insert(inserQuery: InsertQuery): Observable<number>;
    beginTransaction(): void;
    endTransaction(isOperationSuccessful: boolean, useExternalDb?: boolean): void;
    copyDatabase(destination: string): Observable<boolean>;
    open(dbFilePath: string): Promise<undefined>;
}
