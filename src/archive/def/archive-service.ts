import {Observable} from 'rxjs';

export enum ArchiveObjectType {
    CONTENT = 'content',
    PROFILE = 'profile',
    TELEMETRY = 'telemetry'
}

export interface ArchiveExportRequest {
    objects: {
        type: ArchiveObjectType;
        identifier?: string;
    }[];
    filePath: string;
}

export interface ArchivePackageContext {
    workspacePath: string;
}

export interface ArchivePackageMeta {
    objectType: ArchiveObjectType;
    file: string;
    contentEncoding: 'identity' | 'gzip';
    size: number;
    explodedSize: number;
}

export interface ArchivePackageProgress<T extends ArchivePackageMeta = any> {
    task: string;
    completed: T[];
}

export interface ArchiveExportProgress {
    task: string;
    progress: Map<ArchiveObjectType, ArchivePackageProgress>;
    filePath?: string;
}

export interface ArchiveService {
    export(exportRequest: ArchiveExportRequest): Observable<ArchiveExportProgress>;
}
