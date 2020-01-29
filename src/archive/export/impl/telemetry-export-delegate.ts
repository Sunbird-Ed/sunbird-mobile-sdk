import {ArchiveExportDelegate} from '..';
import {ArchiveExportRequest, ArchiveObjectType, ArchivePackageContext, ArchivePackageProgress} from '../..';
import {DbService} from '../../../db';
import {FileService} from '../../../util/file/def/file-service';
import {TelemetryProcessedEntry} from '../../../telemetry/db/schema';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TelemetryArchivePackageMeta} from '../def/telemetry-archive-package-meta';
import {ObjectNotFoundError} from '../error/object-not-found-error';

export class TelemetryExportDelegate implements ArchiveExportDelegate {
    private workspaceSubPath: string;

    constructor(
        private dbService: DbService,
        private fileService: FileService,
    ) {
    }

    export(request: Pick<ArchiveExportRequest, 'filePath'>, context: ArchivePackageContext): Observable<ArchivePackageProgress<TelemetryArchivePackageMeta>> {
        return new Observable((observer) => {
            (async () => {
                let archivePackageProgress: ArchivePackageProgress<TelemetryArchivePackageMeta> = {
                    task: '',
                    completed: [],
                };

                observer.next(archivePackageProgress = {
                    ...archivePackageProgress,
                    task: 'VALIDATING',
                });

                try {
                    await this.validate();
                } catch (e) {
                    observer.error(e);
                    return;
                }

                observer.next(archivePackageProgress = {
                    ...archivePackageProgress,
                    task: 'PREPARING'
                });

                await this.prepare(context);

                observer.next(archivePackageProgress = {
                    ...archivePackageProgress,
                    task: 'INITIALIZING'
                });

                await this.createWorkspace();

                const messageIds = await this.getMessageIds();

                try {
                    while (messageIds.length) {
                        const currentMessageId = messageIds.pop()!;
                        await this.processBatch(currentMessageId).then((result) => {
                            if (!result) {
                                observer.next(archivePackageProgress = {
                                    ...archivePackageProgress,
                                    task: 'SKIPPING_BATCH'
                                });
                                return;
                            }

                            const {file, mid, eventsCount, size} = result;

                            observer.next(archivePackageProgress = {
                                ...archivePackageProgress,
                                task: 'BUILDING_BATCH',
                                completed: [
                                    ...archivePackageProgress.completed,
                                    {
                                        file,
                                        mid,
                                        eventsCount,
                                        size,
                                        objectType: ArchiveObjectType.TELEMETRY,
                                        contentEncoding: 'gzip',
                                        explodedSize: -1
                                    }
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
                    task: 'OBJECT_ARCHIVE_COMPLETE',
                });

                observer.complete();
            })();
        });
    }

    private async validate() {
        const batchCount = await this.dbService.execute(`
            SELECT count(*) as COUNT FROM ${TelemetryProcessedEntry.TABLE_NAME}
        `.trim()).pipe(
            map((result) => {
                return result && result[0] && (result[0]['COUNT']);
            })
        ).toPromise();

        if (!batchCount) {
            throw new ObjectNotFoundError('No telemetry to export');
        }
    }

    private async prepare(context: ArchivePackageContext) {
        this.workspaceSubPath = `${context.workspacePath}`;
    }

    private async createWorkspace(): Promise<DirectoryEntry> {
        return this.fileService.createDir(this.workspaceSubPath, false);
    }

    private async getMessageIds(): Promise<string[]> {
        const entries = await this.dbService.read({
            table: TelemetryProcessedEntry.TABLE_NAME,
            columns: [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID],
            distinct: true
        }).toPromise();

        return entries.map((e) => e[TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]);
    }

    private async processBatch(messageId: string): Promise<{ file: string, mid: string, eventsCount: number, size: number } | undefined> {
        const batch: TelemetryProcessedEntry.SchemaMap = (await this.dbService.read({
            table: TelemetryProcessedEntry.TABLE_NAME,
            selection: `${TelemetryProcessedEntry.COLUMN_NAME_MSG_ID} = ?`,
            selectionArgs: [messageId]
        }).toPromise())[0];

        if (!batch) {
            return;
        }

        await this.fileService.writeFile(
            this.workspaceSubPath,
            batch[TelemetryProcessedEntry.COLUMN_NAME_MSG_ID],
            batch[TelemetryProcessedEntry.COLUMN_NAME_DATA],
            {
                replace: true
            }
        );

        return {
            size: [TelemetryProcessedEntry.COLUMN_NAME_DATA].length,
            eventsCount: batch[TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS],
            mid: batch[TelemetryProcessedEntry.COLUMN_NAME_MSG_ID],
            file: `${batch[TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]}`
        };
    }
}
