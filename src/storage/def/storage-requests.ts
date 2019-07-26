export enum ExistingContentAction {
    IGNORE = 'IGNORE',
    KEEP_HIGER_VERSION = 'KEEP_HIGER_VERSION',
    KEEP_LOWER_VERSION = 'KEEP_LOWER_VERSION',
    KEEP_SOURCE = 'KEEP_SOURCE',
    KEEP_DESTINATION = 'KEEP_DESTINATION'
}

export interface TransferContentsRequest {
    contentIds: string[];
    existingContentAction: ExistingContentAction;
    destinationFolder: string;
    sourceFolder?: string;
    deleteDestination: boolean;
    shouldMergeInDestination?: boolean;
}
