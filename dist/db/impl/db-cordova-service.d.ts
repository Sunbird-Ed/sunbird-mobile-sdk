import { DbConfig, DbService, DeleteQuery, InsertQuery, Migration, ReadQuery, UpdateQuery } from '..';
import { Observable } from 'rxjs';
export declare class DbCordovaService implements DbService {
    private context;
    private dBVersion;
    private appMigrationList;
    private initialized;
    constructor(context: DbConfig, dBVersion: number, appMigrationList: Migration[]);
    update(updateQuery: UpdateQuery): Observable<boolean>;
    init(): void;
    private onCreate;
    private onUpgrade;
    execute(query: string): Observable<any>;
    read(readQuery: ReadQuery): Observable<any[]>;
    insert(inserQuery: InsertQuery): Observable<number>;
    private prepareMigrationList;
    delete(deleteQuery: DeleteQuery): Observable<number>;
    beginTransaction(): void;
    endTransaction(isOperationSuccessful: boolean): void;
}
