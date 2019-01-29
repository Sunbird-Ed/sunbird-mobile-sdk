export declare abstract class Migration {
    targetDbVersion: number;
    constructor(targetDbVersion: number);
    abstract queries(): Array<string>;
    required(oldVersion: number, newVersion: number): boolean;
}
