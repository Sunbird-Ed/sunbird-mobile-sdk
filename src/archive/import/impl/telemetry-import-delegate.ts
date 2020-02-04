import {ArchiveImportDelegate} from '..';
import {
    ArchiveImportRequest,
    ArchiveObjectImportProgress,
    ArchivePackageExportContext,
    ArchivePackageImportContext
} from '../..';
import {Observable} from 'rxjs';
import {TelemetryArchivePackageMeta} from '../../export/def/telemetry-archive-package-meta';
import {UnknownObjectError} from '../error/unknown-object-error';
import {DbService} from '../../../db';
import {FileService} from '../../../util/file/def/file-service';
import {TelemetryEntry, TelemetryProcessedEntry} from '../../../telemetry/db/schema';

export class TelemetryImportDelegate implements ArchiveImportDelegate {
    private workspaceSubPath: string;

    constructor(
        private dbService: DbService,
        private fileService: FileService,
    ) {
    }

    import(
        request: Pick<ArchiveImportRequest, 'filePath'>,
        context: ArchivePackageImportContext<TelemetryArchivePackageMeta>
    ): Observable<ArchiveObjectImportProgress> {
        return new Observable((observer) => {
            (async () => {
                let archivePackageProgress: ArchiveObjectImportProgress<TelemetryArchivePackageMeta> = {
                    task: '',
                    pending: [],
                };

                const items = context.items;

                observer.next({
                    task: 'PREPARING',
                    pending: [
                        ...items
                    ]
                });

                await this.prepare(context);

                try {
                    while (items.length) {
                        const currentItem = items.pop()!;

                        if (currentItem.contentEncoding !== 'gzip') {
                            observer.error(new UnknownObjectError(`Unknown content encoding ${currentItem.contentEncoding}`));
                            return;
                        }

                        await this.processBatch(currentItem).then(() => {
                            observer.next(archivePackageProgress = {
                                ...archivePackageProgress,
                                task: 'IMPORTING_BATCH',
                                pending: [
                                    ...items
                                ]
                            });
                        });
                    }
                } catch (e) {
                    observer.error(e);
                    return;
                }

                observer.next(archivePackageProgress = {
                    ...archivePackageProgress,
                    task: 'OBJECT_IMPORT_COMPLETE',
                });

                observer.complete();
            })();
        });
    }

    private async prepare(context: ArchivePackageExportContext) {
        this.workspaceSubPath = `${context.workspacePath}`;
    }

    private async processBatch(item: TelemetryArchivePackageMeta) {
        return this.fileService.readAsBinaryString(this.workspaceSubPath, item.file).then((content) => {
            this.dbService.insert({
                table: TelemetryProcessedEntry.TABLE_NAME,
                modelJson: {
                    [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]: item.mid,
                    [TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS]: item.eventsCount,
                    [TelemetryEntry.COLUMN_NAME_PRIORITY]: 1,
                    [TelemetryProcessedEntry.COLUMN_NAME_DATA]: content
                }
            }).toPromise();
        });
    }
}
