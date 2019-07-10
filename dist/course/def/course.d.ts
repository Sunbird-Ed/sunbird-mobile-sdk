export interface Course {
    dateTime?: string;
    identifier?: string;
    lastReadContentStatus?: number;
    enrolledDate?: string;
    addedBy?: string;
    contentId?: string;
    active?: boolean;
    description?: string;
    courseLogoUrl?: string;
    batchId?: string;
    userId?: string;
    courseName?: string;
    leafNodesCount?: number;
    progress?: number;
    id?: string;
    lastReadContentId?: string;
    courseId?: string;
    status?: number;
    contentsPlayedOffline?: string[];
    batch?: {
        [key: string]: any;
    };
}
