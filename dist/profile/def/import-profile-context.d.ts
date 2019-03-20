export interface ImportProfileContext {
    sourceDBFilePath: string;
    metadata?: {
        [key: string]: any;
    };
    imported?: number;
    failed?: number;
}
