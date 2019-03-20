export interface ProfileExportRequest {
    userIds: string[];
    groupIds?: string[];
    destinationFolder: string;
}
export interface ExportProfileContext {
    userIds: string[];
    groupIds: string[];
    destinationFolder: string;
    destinationDBFilePath: string;
    metadata: any;
}
