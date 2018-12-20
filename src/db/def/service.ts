import {InsertQuery, ReadQuery, UpdateQuery} from "./query";

export abstract class Service {

    abstract execute(rawQuery: string): Promise<any>;

    abstract read(readQuery: ReadQuery): Promise<string>;

    abstract insert(insertQuery: InsertQuery): Promise<number>;

    abstract update(updateQuery: UpdateQuery): Promise<boolean>;

    abstract delete(rawQuery: string): Promise<boolean>;

    abstract beginTransaction(): void;

    abstract endTransaction(isOperationSuccessful: boolean): void;

}