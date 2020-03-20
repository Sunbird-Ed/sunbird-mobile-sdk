import { ArchiveExportDelegate } from '..';
import { ArchiveExportRequest, ArchivePackageExportContext, ArchiveObjectExportProgress } from '../..';
import { DbService } from '../../../db';
import { FileService } from '../../../util/file/def/file-service';
import { Observable } from 'rxjs';
import { TelemetryArchivePackageMeta } from '../def/telemetry-archive-package-meta';
export declare class TelemetryExportDelegate implements ArchiveExportDelegate {
    private dbService;
    private fileService;
    private workspaceSubPath;
    constructor(dbService: DbService, fileService: FileService);
    export(request: Pick<ArchiveExportRequest, 'filePath'>, context: ArchivePackageExportContext): Observable<ArchiveObjectExportProgress<TelemetryArchivePackageMeta>>;
    private validate;
    private prepare;
    private createWorkspace;
    private getMessageIds;
    private processBatch;
}
