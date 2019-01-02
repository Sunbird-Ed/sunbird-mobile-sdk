import {InsertQuery, ReadQuery, UpdateQuery} from './query';

export abstract class Service {

    abstract execute(rawQuery: string): Promise<any>;

    abstract read(readQuery: ReadQuery): Promise<any[]>;

    abstract insert(insertQuery: InsertQuery): Promise<number>;

    abstract update(updateQuery: UpdateQuery): Promise<boolean>;

    abstract delete(table: string, whereClause: string, whereArgs: string[]): Promise<number>;

    abstract beginTransaction(): void;

    abstract endTransaction(isOperationSuccessful: boolean): void;

}