export interface Group {
    gid: string;
    name: string;
    syllabus: string[];
    createdAt: number;
    grade: string[];
    gradeValue: {
        [key: string]: any;
    };
    updatedAt: number;
    profilesCount?: number;
}
export interface GroupProfile {
    gid: string;
    uid: string;
}
