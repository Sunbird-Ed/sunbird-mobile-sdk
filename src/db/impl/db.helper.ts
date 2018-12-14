import {Injectable} from "@angular/core";
import {DBContext} from "./db.context";
import {DBService} from "../def/db.service";

@Injectable()
export class DBhelper implements DBService {

    private context: DBContext;
    private initialized: boolean = false;

    constructor(context: DBContext) {
        this.context = context;
    }

    private init() {
        this.initialized = true;

        (<any>window).db.init(this.context.getDBName(),
            this.context.getDBVersion(),
            this.prepareMigrationList(),
            value => {
                if (value.method === "onCreate") {
                    this.onCreate();
                } else if (value.method === "onUpgrade") {
                    this.onUpgrade(value.oldVersion, value.newVersion);
                }
            });
    }

    private prepareMigrationList(): any {
        let migrationList = this.context.getAppMigrationList();
        let migrations: Array<any> = [];
        migrationList.forEach(migration => {
            let m = {};
            m["targetDbVersion"] = migration.targetDbVersion;
            m["queryList"] = migration.queries();
            migrations.push(m);
        });
        return migrations;
    }

    private onCreate() {

    }

    private onUpgrade(oldVersion: number, newVersion: number) {

    }

    execute(query: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            (<any>window).db.execute(query, value => {
               resolve(value);
            }, error => {
                reject(error);
            });
        })
    }

    read(distinct,
         table,
         columns,
         selection,
         selectionArgs,
         groupBy,
         having,
         orderBy,
         limit): Promise<string> {

        if (!this.initialized) {
            this.init();
        }
        return new Promise<string>((resolve, reject) => {
            (<any>window).db.query(distinct,
                table,
                columns,
                selection,
                selectionArgs,
                groupBy,
                having,
                orderBy,
                limit, (json: string) => {
                    resolve(json);
                }, (error: string) => {
                    reject(error);
                });
        });
    }

    insert(tableName: string, json: string): Promise<number> {
        if (!this.initialized) {
            this.init();
        }

        return new Promise<number>((resolve, reject) => {
            (<any>window).db.insert(tableName,
                json, (number: number) => {
                    resolve(number);
                }, (error: string) => {
                    reject(error);
                });
        });
    }

    update(query: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    delete(query: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    beginTransaction(): void {
        (<any>window).db.beginTransaction();
    }

    endTransaction(isOperationSuccessful: boolean): void {
        (<any>window).db.endTransaction(isOperationSuccessful);
    }


}