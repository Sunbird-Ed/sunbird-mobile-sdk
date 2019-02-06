import {ProfileEntry} from '../db/schema';
import {Profile} from '..';
import {ProfileType, ProfileSource} from '..';

export class ProfileMapper {
    public static mapProfileDBEntryToProfile(profileEntry: ProfileEntry.SchemaMap): Profile {
        return {
            uid: profileEntry[ProfileEntry.COLUMN_NAME_UID],
            handle: profileEntry[ProfileEntry.COLUMN_NAME_HANDLE],
            createdAt: profileEntry[ProfileEntry.COLUMN_NAME_CREATED_AT],
            medium: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_MEDIUM]),
            board: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_BOARD]),
            subject: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_SUBJECT]),
            profileType: profileEntry[ProfileEntry.COLUMN_NAME_PROFILE_TYPE] as ProfileType,
            grade: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_GRADE]),
            syllabus: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_SYLLABUS]),
            source: profileEntry[ProfileEntry.COLUMN_NAME_SOURCE] as ProfileSource,
            gradeValue: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_GRADE_VALUE])
        };
    }

    public static mapProfileToProfileDBEntry(profile: Profile): ProfileEntry.SchemaMap {
        return {
            [ProfileEntry.COLUMN_NAME_UID]: profile.uid,
            [ProfileEntry.COLUMN_NAME_HANDLE]: profile.handle,
            [ProfileEntry.COLUMN_NAME_CREATED_AT]: profile.createdAt,
            [ProfileEntry.COLUMN_NAME_MEDIUM]: (profile.medium ? profile.medium.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_BOARD]: (profile.board ? profile.board.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_SUBJECT]: (profile.subject ? profile.subject.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_PROFILE_TYPE]: profile.profileType,
            [ProfileEntry.COLUMN_NAME_GRADE]: (profile.grade ? profile.grade.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_SYLLABUS]: (profile.syllabus ? profile.syllabus.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_SOURCE]: profile.source,
            [ProfileEntry.COLUMN_NAME_GRADE_VALUE]: (profile.gradeValue ? JSON.stringify(profile.gradeValue) : '')
        };
    }

}
