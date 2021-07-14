import { ArchiveImportDelegate } from '..';
import { ArchiveImportRequest, ArchiveObjectImportProgress, ArchivePackageImportContext } from '../..';
import { Observable } from 'rxjs';
import { TelemetryArchivePackageMeta } from '../../export/def/telemetry-archive-package-meta';
import { DbService } from '../../../db';
import { FileService } from '../../../util/file/def/file-service';
import { NetworkQueue } from '../../../api/network-queue';
import { SdkConfig } from '../../../sdk-config';
export declare class TelemetryImportDelegate implements ArchiveImportDelegate {
    private dbService;
    private fileService;
    private networkQueue;
    private sdkConfig;
    private workspaceSubPath;
    constructor(dbService: DbService, fileService: FileService, networkQueue: NetworkQueue, sdkConfig: SdkConfig);
    import(request: Pick<ArchiveImportRequest, 'filePath'>, context: ArchivePackageImportContext<TelemetryArchivePackageMeta>): Observable<ArchiveObjectImportProgress>;
    private prepare;
    private processBatch;
}
