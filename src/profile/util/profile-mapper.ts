import {ProfileEntry} from '../db/schema';
import {Profile} from '..';
import { ProfileType, ProfileSource } from '../def/profile';

export class ProfileMapper {
    public static mapProfileDBEntryToProfile(profileEntry: ProfileEntry.SchemaMap): Profile {
        return {
            uid: profileEntry[ProfileEntry.COLUMN_NAME_UID],
            handle: profileEntry[ProfileEntry.COLUMN_NAME_HANDLE],
            created_at: profileEntry[ProfileEntry.COLUMN_NAME_CREATED_AT],
            medium: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_MEDIUM]),
            board: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_BOARD]),
            subject: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_SUBJECT]),
            profile_type: profileEntry[ProfileEntry.COLUMN_NAME_PROFILE_TYPE] as ProfileType,
            grade: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_GRADE]),
            syllabus: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_SYLLABUS]),
            source: profileEntry[ProfileEntry.COLUMN_NAME_SOURCE] as ProfileSource,
            grade_value: JSON.parse(profileEntry[ProfileEntry.COLUMN_NAME_GRADE_VALUE])
        };
    }

    public static mapProfileToProfileDBEntry(profile: Profile): ProfileEntry.SchemaMap {
        return {
            [ProfileEntry.COLUMN_NAME_UID]: profile.uid,
            [ProfileEntry.COLUMN_NAME_HANDLE]: JSON.stringify(profile.handle),
            [ProfileEntry.COLUMN_NAME_CREATED_AT]: profile.created_at,
            [ProfileEntry.COLUMN_NAME_MEDIUM]: JSON.stringify(profile.medium),
            [ProfileEntry.COLUMN_NAME_BOARD]: JSON.stringify(profile.board),
            [ProfileEntry.COLUMN_NAME_SUBJECT]: JSON.stringify(profile.subject),
            [ProfileEntry.COLUMN_NAME_PROFILE_TYPE]: JSON.stringify(profile.profile_type),
            [ProfileEntry.COLUMN_NAME_GRADE]: JSON.stringify(profile.grade),
            [ProfileEntry.COLUMN_NAME_SYLLABUS]: JSON.stringify(profile.syllabus),
            [ProfileEntry.COLUMN_NAME_SOURCE]: JSON.stringify(profile.source),
            [ProfileEntry.COLUMN_NAME_GRADE_VALUE]: JSON.stringify(profile.grade_value)
        };
    }

}
