export abstract class DBService {

    abstract execute(query: string): Promise<any>;

    abstract read(distinct,
        table,
        columns,
        selection,
        selectionArgs,
        groupBy,
        having,
        orderBy,
        limit): Promise<string>;

    abstract insert(tableName: string, json: string): Promise<number>;

    abstract update(query: string): Promise<boolean>;

    abstract delete(query: string): Promise<boolean>;

    abstract beginTransaction(): void;

    abstract endTransaction(isOperationSuccessful: boolean): void;

}