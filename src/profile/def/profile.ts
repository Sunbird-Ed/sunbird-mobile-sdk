import {ServerProfile} from './server-profile';

export {
    UserDeclaration, UserFeedEntry, UserFeedCategory, UserFeedStatus
} from '@project-sunbird/client-services/models/user';

export enum ProfileType {
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'administrator',
    PARENT = 'parent',
    OTHER = 'other',
    NONE = 'none'
}

export enum ProfileSource {
    SERVER = 'server',
    LOCAL = 'local'
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
    categories?: string;
}

