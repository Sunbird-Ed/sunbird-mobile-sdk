import {EMPTY, Observable, of, throwError} from 'rxjs';
import {ErrorStackEntry} from '../db/schema';
import {ApiService, HttpRequestType, Request} from '../../api';
import {DbService} from '../../db';
import {ErrorLoggerConfig} from '../config/error-logger-config';
import {NetworkInfoService, NetworkStatus} from '../../util/network';
import {ErrorStackMapper} from '../util/error-stack-mapper';
import {ErrorStack} from '../def/error-stack';
import {DeviceSpec} from '../../util/device';
import {ErrorStackSyncRequestDecorator} from './error-stack-sync-request-decorator';
import {catchError, expand, map, mapTo, mergeMap} from 'rxjs/operators';
import _ID = ErrorStackEntry._ID;

interface ErrorLoggerRequest {
    pdata: ProducerData;
    context: Context;
    logs: Array<ErrorStack>;
}

interface ProducerData {
    id: string;
    pid: string;
    ver: string;
}

interface Context {
    did: string;
    dspec: DeviceSpec;
    extras: any;
}

export class ErrorStackSyncHandler {
    constructor(
        private apiService: ApiService,
        private dbService: DbService,
        private errorLoggerConfig: ErrorLoggerConfig,
        private networkInfoService: NetworkInfoService,
        private errorStackSyncRequestDecorator: ErrorStackSyncRequestDecorator
    ) {
    }

    handle(errorSyncBandwidth: number): Observable<undefined> {
        return this.processBatch(errorSyncBandwidth)
            .pipe(
                expand(processedCount => {
                    if (processedCount > 0) {
                        return this.processBatch(errorSyncBandwidth);
                    }

                    return EMPTY;
                }),
                mapTo(undefined),
                catchError(() => of(undefined))
            );
    }

    private processBatch(errorSyncBandwidth: number): Observable<number> {
        return this.getErrorStackBatch(errorSyncBandwidth)
            .pipe(
                mergeMap((errorStackList) => this.sync(errorStackList)),
                mergeMap((errorStackList) => this.clearLogs(errorStackList)),
                map((errorStackList) => errorStackList.length)
            );
    }

    private getErrorStackBatch(errorSyncBandwidth: number): Observable<ErrorStackEntry.SchemaMap[]> {
        return this.dbService.execute(`
                SELECT * FROM ${ErrorStackEntry.TABLE_NAME}
                LIMIT ${errorSyncBandwidth}
            `);
    }

    private clearLogs(errorStackList: ErrorStackEntry.SchemaMap[]): Observable<ErrorStackEntry.SchemaMap[]> {
        if (!errorStackList.length) {
            return of(errorStackList);
        }

        return this.dbService.execute(`
                DELETE FROM ${ErrorStackEntry.TABLE_NAME}
                WHERE ${ErrorStackEntry._ID} IN (${errorStackList.map((e) => e[_ID]).join(',')})
            `)
            .pipe(
                mapTo(errorStackList)
            );
    }

    private sync(errorStackList: ErrorStackEntry.SchemaMap[]): Observable<ErrorStackEntry.SchemaMap[]> {
        if (!errorStackList.length) {
            return of(errorStackList);
        }

        return this.networkInfoService.networkStatus$
            .pipe(
                mergeMap((status) => {
                    if (status === NetworkStatus.OFFLINE) {
                        return throwError(new Error('Fake Error'));
                    }

                    const request = {
                        pdata: undefined,
                        context: undefined,
                        logs: errorStackList.map(e => ErrorStackMapper.mapErrorSatckDBEntryToErrorStack(e))
                    };

                    return this.errorStackSyncRequestDecorator.decorate(request)
                        .pipe(
                            mergeMap(() => {
                                const apiRequest: Request = new Request.Builder()
                                    .withType(HttpRequestType.POST)
                                    .withPath(this.errorLoggerConfig.errorLoggerApiPath)
                                    .withBearerToken(true)
                                    .withBody({
                                        request
                                    })
                                    .build();

                                return this.apiService.fetch(apiRequest);
                            })
                        );
                }),
                mapTo(errorStackList)
            );
    }
}
