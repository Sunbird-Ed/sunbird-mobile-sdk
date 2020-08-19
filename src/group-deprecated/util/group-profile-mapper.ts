import {GroupProfileEntry} from '../../profile/db/schema';
import {GroupProfileDeprecated} from '..';

export class GroupProfileMapper {
    public static mapGroupProfileDBEntryToGroupProfile(groupProfileEntry: GroupProfileEntry.SchemaMap): GroupProfileDeprecated {
        return {
            gid: groupProfileEntry[GroupProfileEntry.COLUMN_NAME_GID],
            uid: groupProfileEntry[GroupProfileEntry.COLUMN_NAME_UID]
        };
    }

    public static mapGroupToGroupDBEntry(groupProfile: GroupProfileDeprecated): GroupProfileEntry.SchemaMap {
        return {
            [GroupProfileEntry.COLUMN_NAME_GID]: groupProfile.gid,
            [GroupProfileEntry.COLUMN_NAME_UID]: groupProfile.uid
        };
    }

}
