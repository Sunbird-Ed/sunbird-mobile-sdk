export interface ExportProfileContext {
    userIds: string[];
    groupIds: string[];
    destinationFolder?: string;
    destinationDBFilePath?: string;
    metadata?: {
        [key: string]: any;
    };
    size?: string;
}
