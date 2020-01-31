import {Observable} from 'rxjs';

export enum ArchiveObjectType {
    CONTENT = 'content',
    PROFILE = 'profile',
    TELEMETRY = 'telemetry'
}

export interface ArchiveImportRequest {
    objects: {
        type: ArchiveObjectType;
        identifier?: string;
    }[];
    filePath: string;
}

export interface ArchiveExportRequest {
    objects: {
        type: ArchiveObjectType;
        identifier?: string;
    }[];
    filePath: string;
}

export interface ArchivePackageExportContext {
    workspacePath: string;
}

export interface ArchivePackageImportContext<T extends ArchivePackageMeta> {
    workspacePath: string;
    items: T[];
}

export interface ArchivePackageMeta {
    objectType: ArchiveObjectType;
    file: string;
    contentEncoding: 'identity' | 'gzip';
    size: number;
    explodedSize: number;
}

export interface TelemetryPackageMeta extends ArchivePackageMeta {
    mid: string;
    eventsCount: number;
}

export interface ArchiveObjectExportProgress<T extends ArchivePackageMeta = any> {
    task: string;
    completed: T[];
}

export interface ArchiveExportProgress {
    task: string;
    progress: Map<ArchiveObjectType, ArchiveObjectExportProgress>;
    filePath?: string;
}

export interface ArchiveObjectImportProgress<T extends ArchivePackageMeta = any> {
    task: string;
    pending: T[];
}

export interface ArchiveImportProgress {
    task: string;
    progress: Map<ArchiveObjectType, ArchiveObjectImportProgress>;
    filePath?: string;
}

export interface ArchiveService {
    export(exportRequest: ArchiveExportRequest): Observable<ArchiveExportProgress>;
    import(importRequest: ArchiveImportRequest): Observable<ArchiveImportProgress>;
}
