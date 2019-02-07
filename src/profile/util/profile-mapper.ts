import {ProfileEntry} from '../db/schema';
import {Profile, ProfileSource, ProfileType} from '..';

export class ProfileMapper {
    public static mapProfileDBEntryToProfile(profileEntry: ProfileEntry.SchemaMap): Profile {
        return {
            uid: profileEntry[ProfileEntry.COLUMN_NAME_UID],
            handle: profileEntry[ProfileEntry.COLUMN_NAME_HANDLE],
            created_at: profileEntry[ProfileEntry.COLUMN_NAME_CREATED_AT],
            medium: profileEntry[ProfileEntry.COLUMN_NAME_MEDIUM].split(','),
            board: profileEntry[ProfileEntry.COLUMN_NAME_BOARD].split(','),
            subject: profileEntry[ProfileEntry.COLUMN_NAME_SUBJECT].split(','),
            profile_type: profileEntry[ProfileEntry.COLUMN_NAME_PROFILE_TYPE] as ProfileType,
            grade: profileEntry[ProfileEntry.COLUMN_NAME_GRADE].split(','),
            syllabus: profileEntry[ProfileEntry.COLUMN_NAME_SYLLABUS].split(','),
            source: profileEntry[ProfileEntry.COLUMN_NAME_SOURCE] as ProfileSource,
            grade_value: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_GRADE_VALUE])
        };
    }

    public static mapProfileToProfileDBEntry(profile: Profile): ProfileEntry.SchemaMap {
        return {
            [ProfileEntry.COLUMN_NAME_UID]: profile.uid,
            [ProfileEntry.COLUMN_NAME_HANDLE]: profile.handle,
            [ProfileEntry.COLUMN_NAME_CREATED_AT]: profile.created_at,
            [ProfileEntry.COLUMN_NAME_MEDIUM]: (profile.medium ? profile.medium.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_BOARD]: (profile.board ? profile.board.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_SUBJECT]: (profile.subject ? profile.subject.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_PROFILE_TYPE]: profile.profile_type,
            [ProfileEntry.COLUMN_NAME_GRADE]: (profile.grade ? profile.grade.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_SYLLABUS]: (profile.syllabus ? profile.syllabus.join(',') : ''),
            [ProfileEntry.COLUMN_NAME_SOURCE]: profile.source,
            [ProfileEntry.COLUMN_NAME_GRADE_VALUE]: (profile.grade_value ? JSON.stringify(profile.grade_value) : '')
        };
    }

}
