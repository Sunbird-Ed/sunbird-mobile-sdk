import {ArchiveExportProgress, ArchiveExportRequest, ArchiveObjectType, ArchivePackageProgress, ArchiveService} from '..';
import {combineLatest, from, Observable, concat, defer, throwError} from 'rxjs';
import {concatMap, map, mapTo, tap} from 'rxjs/operators';
import {UniqueId} from '../../db/util/unique-id';
import {FileService} from '../../util/file/def/file-service';
import {TelemetryExportDelegate} from '../export/impl/telemetry-export-delegate';
import {DbService} from '../../db';
import {InjectionTokens} from '../../injection-tokens';
import {inject, injectable} from 'inversify';
import {ProducerData, TelemetryService} from '../../telemetry';
import {ZipService} from '../../util/zip/def/zip-service';
import {InvalidRequestError} from '../export/error/invalid-request-error';

interface ArchiveManifest {
    id: string;
    ver: string;
    ts: string;
    producer: ProducerData;
    archive: {
        count: number;
        items: {
            objectType: ArchiveObjectType
            file: string;
            contentEncoding: 'identity' | 'gzip';
            size: number;
            explodedSize: number;
        }[];
    };
}

@injectable()
export class ArchiveServiceImpl implements ArchiveService {
    private static ARCHIVE_ID = 'sunbird.data.archive';
    private static ARCHIVE_VERSION = '1.0';

    constructor(
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.TELEMETRY_SERVICE) private telemetryService: TelemetryService,
        @inject(InjectionTokens.ZIP_SERVICE) private zipService: ZipService
    ) {
    }

    private static reduceObjectProgressToArchivePackageProgress(
        results: { type: ArchiveObjectType, progress: ArchivePackageProgress }[]
    ): Map<ArchiveObjectType, ArchivePackageProgress> {
        return results.reduce((acc, {type, progress}) => {
            acc.set(type, progress);
            return acc;
        }, new Map<ArchiveObjectType, ArchivePackageProgress>());
    }

    export(exportRequest: ArchiveExportRequest): Observable<ArchiveExportProgress> {
        const workspacePath = `${cordova.file.externalCacheDirectory}${UniqueId.generateUniqueId()}`;
        let lastResult: ArchiveExportProgress | undefined;

        if (!exportRequest.objects.length) {
            return throwError(new InvalidRequestError('No archive objects to export'));
        }

        return concat(
            from(this.fileService.createDir(workspacePath, false)).pipe(
                concatMap(() => {
                    return combineLatest(
                        exportRequest.objects.map<Observable<{ type: ArchiveObjectType, progress: ArchivePackageProgress }>>(object => {
                            switch (object.type) {
                                case ArchiveObjectType.CONTENT:
                                    // TODO
                                    throw new Error('To be implemented');
                                case ArchiveObjectType.PROFILE:
                                    // TODO
                                    throw new Error('To be implemented');
                                case ArchiveObjectType.TELEMETRY:
                                    return new TelemetryExportDelegate(
                                        this.dbService,
                                        this.fileService,
                                    ).export({ filePath: exportRequest.filePath }, { workspacePath }).pipe(
                                        map((progress) => ({ type: ArchiveObjectType.TELEMETRY, progress: progress }))
                                    );
                            }
                        })
                    );
                }),
                map((results: { type: ArchiveObjectType, progress: ArchivePackageProgress }[]) => {
                    return {
                        task: 'BUILDING',
                        progress: ArchiveServiceImpl.reduceObjectProgressToArchivePackageProgress(results)
                    };
                }),
                tap((results) => lastResult = results)
            ),
            defer(() => this.generateManifestFile(lastResult!, workspacePath)),
            defer(() => this.generateZipArchive(lastResult!, workspacePath))
        );
    }

    private generateZipArchive(progress: ArchiveExportProgress, workspacePath: string): Observable<ArchiveExportProgress> {
        const zipFilePath = `${cordova.file.externalCacheDirectory}archive-${new Date().toISOString()}.zip`;
        return new Observable((observer) => {
            this.zipService.zip(workspacePath, { target: zipFilePath }, [], [], () => {
                observer.next();
                observer.complete();
            }, (e) => {
                observer.error(e);
            });
        }).pipe(
            mapTo({
                ...progress,
                task: 'COMPLETE',
                filePath: zipFilePath
            })
        );
    }

    private generateManifestFile({ progress}: ArchiveExportProgress, workspacePath: string): Observable<ArchiveExportProgress> {
        return this.telemetryService.buildContext().pipe(
            map((c) => c.pdata),
            concatMap((producerData: ProducerData) => {
                const flattenedItems = Array.from(progress.entries()).reduce<{
                    file: string;
                    contentEncoding: 'identity' | 'gzip';
                }[]>((acc, [objectType, objectProgress]) => {
                    return acc.concat(objectProgress.completed);
                }, []);

                return from(this.fileService.writeFile(
                    workspacePath,
                    'manifest.json',
                    JSON.stringify({
                        id: ArchiveServiceImpl.ARCHIVE_ID,
                        ver: ArchiveServiceImpl.ARCHIVE_VERSION,
                        ts: (new Date()).toISOString(),
                        producer: producerData,
                        archive: {
                            count: flattenedItems.length,
                            items: flattenedItems
                        }
                    } as ArchiveManifest),
                    {
                        replace: true
                    }
                ));
            }),
            mapTo({
                progress,
                task: 'BUILDING_MANIFEST'
            })
        );
    }
}
