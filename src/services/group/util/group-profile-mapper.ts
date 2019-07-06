import {GroupProfileEntry} from '../../profile/db/schema';
import {GroupProfile} from '../index';

export class GroupProfileMapper {
    public static mapGroupProfileDBEntryToGroupProfile(groupProfileEntry: GroupProfileEntry.SchemaMap): GroupProfile {
        return {
            gid: groupProfileEntry[GroupProfileEntry.COLUMN_NAME_GID],
            uid: groupProfileEntry[GroupProfileEntry.COLUMN_NAME_UID]
        };
    }

    public static mapGroupToGroupDBEntry(groupProfile: GroupProfile): GroupProfileEntry.SchemaMap {
        return {
            [GroupProfileEntry.COLUMN_NAME_GID]: groupProfile.gid,
            [GroupProfileEntry.COLUMN_NAME_UID]: groupProfile.uid
        };
    }

}
