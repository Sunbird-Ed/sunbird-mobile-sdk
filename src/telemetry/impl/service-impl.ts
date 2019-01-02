import {DbSdk as DbSdk, InsertQuery, ReadQuery} from "../../db";
import {TelemetryDecorator, TelemetryService, TelemetryStat, TelemetrySyncStat} from "..";
import {TelemetryEntry, TelemetryProcessedEntry} from "./schema";
import {
    CorrelationData,
    End,
    Error as ErrorTelemetry,
    Impression,
    Interact,
    Log,
    Rollup,
    Start,
    TelemetryObject
} from "../def/telemetry.model";

export class TelemetryServiceImpl implements TelemetryService {

    private static readonly KEY_SYNC_TIME = "telemetry_sync_time";

    constructor(private decorator: TelemetryDecorator) {
    }

    audit(): void {
    }

    end(type, mode, pageId, env, object?: TelemetryObject, rollup?: Rollup,
        corRelationList?: Array<CorrelationData>): void {

        const end = new End();
        end.type = type;
        end.pageId = pageId;
        end.env = env;
        end.mode = mode;
        if (object && object.id) {
            end.objId = object.id;
        }

        if (object && object.type) {
            end.objType = object.type;
        }

        if (object && object.version) {
            end.objVer = object.version;
        }
        if (rollup) {
            end.rollup = rollup;
        }
        if (corRelationList) {
            end.correlationData = corRelationList;
        }

        this.save(end);
    }

    error(env, errCode, errorType, pageId, stackTrace): void {
        const error = new ErrorTelemetry();
        error.env = env;
        error.errorCode = errCode;
        error.errorType = errorType;
        error.pageId = pageId;
        error.stacktrace = stackTrace;

        this.save(error);
    }

    impression(type, subtype, pageid, env, objectId?: string, objectType?: string, objectVersion?: string,
               rollup?: Rollup, corRelationList?: Array<CorrelationData>): void {

        const impression = new Impression();
        impression.type = type;
        impression.subType = subtype;
        impression.pageId = pageid;
        impression.env = env;
        impression.objId = objectId ? objectId : '';
        impression.objType = objectType ? objectType : '';
        impression.objVer = objectVersion ? objectVersion : '';

        if (rollup !== undefined) {
            impression.rollup = rollup;
        }
        if (corRelationList !== undefined) {
            impression.correlationData = corRelationList;
        }

        this.save(impression);

    }

    interact(interactType, subType, env, pageId, object?: TelemetryObject, values?: Map<any, any>,
             rollup?: Rollup, corRelationList?: Array<CorrelationData>): void {

        const interact = new Interact();
        interact.type = interactType;
        interact.subType = subType;
        interact.pageId = pageId;
        interact.id = pageId;
        interact.env = env;
        if (values !== null) {
            interact.valueMap = values!!;
        }
        if (rollup !== undefined) {
            interact.rollup = rollup;
        }
        if (corRelationList !== undefined) {
            interact.correlationData = corRelationList;
        }

        if (object && object.id) {
            interact.objId = object.id;
        }

        if (object && object.type) {
            interact.objType = object.type;
        }

        if (object && object.version) {
            interact.objVer = object.version;
        }

        this.save(interact);
    }

    log(logLevel, message, env, type, params: Array<any>): void {
        const log = new Log();
        log.level = logLevel;
        log.message = message;
        log.env = env;
        log.type = type;
        log.params = params;

        this.save(log);
    }

    start(pageId, env, mode, object?: TelemetryObject, rollup?: Rollup, corRelationList?: Array<CorrelationData>): void {

        const start = new Start();
        start.type = object!!.type;
        start.pageId = pageId;
        start.env = env;
        start.mode = mode;
        if (object && object.id) {
            start.objId = object.id;
        }

        if (object && object.type) {
            start.objType = object.type;
        }

        if (object && object.version) {
            start.objVer = object.version;
        }
        if (rollup !== undefined) {
            start.rollup = rollup;
        }
        if (corRelationList !== undefined) {
            start.correlationData = corRelationList;
        }

        this.save(start);
    }

    event(telemetry: any): Promise<boolean> {
        return this.save(telemetry);
    }

    import(sourcePath: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    export(destPath: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    getTelemetryStat(): Promise<TelemetryStat> {
        let telemetryEventCountQuery = "select count(*) from " + TelemetryEntry.TABLE_NAME;
        let processedTelemetryEventCountQuery = "select sum(" + TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS + ") from " + TelemetryProcessedEntry.TABLE_NAME;
        let telemetryEventCount = 0;
        let processedTelemetryEventCount = 0;
        let syncStat = new TelemetryStat();

        return new Promise<TelemetryStat>((resolve, reject) => {
            DbSdk.instance.getService().execute(telemetryEventCountQuery)
                .then(value => {
                    telemetryEventCount = value[0];
                    return DbSdk.instance.getService().execute(processedTelemetryEventCountQuery);
                })
                .then(value => {
                    processedTelemetryEventCount = value[0];
                    syncStat.unSyncedEventCount = telemetryEventCount + processedTelemetryEventCount;
                    let syncTime = localStorage.getItem(TelemetryServiceImpl.KEY_SYNC_TIME);
                    if (syncTime !== null)
                        syncStat.lastSyncTime = parseInt(syncTime);

                    resolve(syncStat);
                })
                .catch(error => {
                    reject(error);
                })
        });
    }


    sync(): Promise<TelemetrySyncStat> {

        let readQuery: ReadQuery = {
            table: TelemetryEntry.TABLE_NAME,
            limit: '1000'
        };

        //fetch events from telemetry table
        DbSdk.instance.getService().read(readQuery,)
            .then(value => {

            })
            .catch(error => {

            });


        throw new Error("Method not implemented.");
    }


    private save(telemetry: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {

            let insertQuery: InsertQuery = {
                table: TelemetryEntry.TABLE_NAME,
                modelJson: JSON.stringify(this.decorator.prepare(this.decorator.decorate(telemetry)))
            };

            DbSdk.instance.getService().insert(insertQuery)

                .then(numberOfRow => {
                    resolve(numberOfRow > 0);
                })
                .catch(error => {
                    reject(error);
                })
        })

    }

}
