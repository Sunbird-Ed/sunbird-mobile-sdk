import { Observable } from 'rxjs';
import { ArchiveExportRequest, ArchivePackageExportContext, ArchiveObjectExportProgress } from '../..';
export interface ArchiveExportDelegate {
    export(request: Pick<ArchiveExportRequest, 'filePath'>, context: ArchivePackageExportContext): Observable<ArchiveObjectExportProgress>;
}
