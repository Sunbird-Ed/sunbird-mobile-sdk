export interface Batch {
    identifier: string;
    id: string;
    createdFor: string[];
    courseAdditionalInfo: any;
    endDate: string;
    description: string;
    participant: any;
    updatedDate: string;
    createdDate: string;
    mentors: string[];
    name: string;
    enrollmentType: string;
    courseId: string;
    startDate: string;
    hashTagId: string;
    status: number;
    courseCreator: string;
    createdBy: string;
    creatorFirstName?: string;
    creatorLastName?: string;
    enrollmentEndDate?: string;
}
