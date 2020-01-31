import {Observable} from 'rxjs';
import {ArchiveImportRequest, ArchiveObjectImportProgress, ArchivePackageImportContext} from '../..';
import {TelemetryArchivePackageMeta} from '../../export/def/telemetry-archive-package-meta';

export interface ArchiveImportDelegate {
    import(request: Pick<ArchiveImportRequest, 'filePath'>, context: ArchivePackageImportContext<TelemetryArchivePackageMeta>):
        Observable<ArchiveObjectImportProgress>;
}
