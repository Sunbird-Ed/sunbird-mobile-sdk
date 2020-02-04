import { ArchiveExportProgress, ArchiveExportRequest, ArchiveImportProgress, ArchiveImportRequest, ArchiveService } from '..';
import { Observable } from 'rxjs';
import { FileService } from '../../util/file/def/file-service';
import { DbService } from '../../db';
import { TelemetryService } from '../../telemetry';
import { ZipService } from '../../util/zip/def/zip-service';
export declare class ArchiveServiceImpl implements ArchiveService {
    private fileService;
    private dbService;
    private telemetryService;
    private zipService;
    private static ARCHIVE_ID;
    private static ARCHIVE_VERSION;
    constructor(fileService: FileService, dbService: DbService, telemetryService: TelemetryService, zipService: ZipService);
    private static reduceObjectProgressToArchiveObjectExportProgress;
    private static reduceObjectProgressToArchiveObjectImportProgress;
    export(exportRequest: ArchiveExportRequest): Observable<ArchiveExportProgress>;
    private generateZipArchive;
    private generateManifestFile;
    import(importRequest: ArchiveImportRequest): Observable<ArchiveImportProgress>;
    private extractZipArchive;
    private readManifestFile;
}
