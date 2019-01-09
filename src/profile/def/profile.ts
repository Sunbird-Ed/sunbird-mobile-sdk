import {ServerProfile} from './server-profile';

export enum ProfileType {
    STUDENT = 'student',
    TEACHER = 'teacher'
}

export enum ProfileSource {
    SERVER = 'server',
    LOCAL = 'local'
}

export interface Profile {
    uid: string;
    handle: string;
    medium: string[];
    board: string[];
    createdAt: number;
    profileType: ProfileType;
    subject: string[];
    grade: string[];
    gradeValueMap: { [key: string]: any };
    syllabus: string[];
    source: ProfileSource;
    serverProfile?: ServerProfile;
}

