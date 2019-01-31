export interface Group {
    gid: string;
    name: string;
    syllabus: string[];
    createdAt: number;
    grade: string[];
    gradeValueMap: {
        [key: string]: any;
    };
    updatedAt: number;
}
export interface GroupProfile {
    gid: string;
    uid: string;
}
