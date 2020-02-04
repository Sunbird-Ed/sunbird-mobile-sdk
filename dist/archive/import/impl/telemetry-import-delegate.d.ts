import { ArchiveImportDelegate } from '..';
import { ArchiveImportRequest, ArchiveObjectImportProgress, ArchivePackageImportContext } from '../..';
import { Observable } from 'rxjs';
import { TelemetryArchivePackageMeta } from '../../export/def/telemetry-archive-package-meta';
import { DbService } from '../../../db';
import { FileService } from '../../../util/file/def/file-service';
export declare class TelemetryImportDelegate implements ArchiveImportDelegate {
    private dbService;
    private fileService;
    private workspaceSubPath;
    constructor(dbService: DbService, fileService: FileService);
    import(request: Pick<ArchiveImportRequest, 'filePath'>, context: ArchivePackageImportContext<TelemetryArchivePackageMeta>): Observable<ArchiveObjectImportProgress>;
    private prepare;
    private processBatch;
}
