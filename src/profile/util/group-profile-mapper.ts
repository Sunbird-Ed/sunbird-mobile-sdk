import {GroupProfileEntry} from '../db/schema';
import {GroupProfile} from '../def/group';

export class GroupProfileMapper {
    public static mapGroupProfileDBEntryToGroupProfile(groupProfileEntry: GroupProfileEntry.SchemaMap): GroupProfile {
        return {
            gid: JSON.parse(groupProfileEntry[GroupProfileEntry.COLUMN_NAME_GID]),
            uid: JSON.parse(groupProfileEntry[GroupProfileEntry.COLUMN_NAME_UID])
        };
    }

    public static mapGroupToGroupDBEntry(groupProfile: GroupProfile): GroupProfileEntry.SchemaMap {
        return {
            [GroupProfileEntry.COLUMN_NAME_GID]: JSON.stringify(groupProfile.gid),
            [GroupProfileEntry.COLUMN_NAME_UID]: JSON.stringify(groupProfile.uid),
        };
    }

}
