export interface GroupDeprecated {
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
export interface GroupProfileDeprecated {
    gid: string;
    uid: string;
}
