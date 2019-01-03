export abstract class Migration {

    targetDbVersion: number;

    constructor(targetDbVersion: number) {
        this.targetDbVersion = targetDbVersion;
    }

    abstract queries(): Array<string>;

    required(oldVersion: number, newVersion: number): boolean {
        return oldVersion < this.targetDbVersion && this.targetDbVersion <= newVersion;
    }

}
