import {ServerProfile} from './server-profile';

export enum ProfileType {
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER'
}

export enum ProfileSource {
    SERVER = 'SERVER',
    LOCAL = 'LOCAL'
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
    gradeValue?: { [key: string]: any };
    serverProfile?: ServerProfile;
}

