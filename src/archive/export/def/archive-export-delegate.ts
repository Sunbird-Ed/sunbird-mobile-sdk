import {Observable} from 'rxjs';
import {ArchiveExportRequest, ArchivePackageContext, ArchivePackageProgress} from '../..';

export interface ArchiveExportDelegate {
    export(request: Exclude<ArchiveExportRequest, 'objectTypes'>, context: ArchivePackageContext): Observable<ArchivePackageProgress>;
}
