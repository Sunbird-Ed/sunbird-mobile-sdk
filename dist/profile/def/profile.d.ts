import { ServerProfile } from './server-profile';
export declare enum ProfileType {
    STUDENT = "student",
    TEACHER = "teacher"
}
export declare enum ProfileSource {
    SERVER = "server",
    LOCAL = "local"
}
export interface Profile {
    uid: string;
    handle: string;
    createdAt?: number;
    medium?: string[];
    board?: string[];
    subject?: string[];
    profileType: ProfileType;
    grade?: string[];
    syllabus?: string[];
    source: ProfileSource;
    gradeValue?: {
        [key: string]: any;
    };
    serverProfile?: ServerProfile;
}
