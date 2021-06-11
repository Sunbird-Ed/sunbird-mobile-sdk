import { GroupProfileEntry } from '../../profile/db/schema';
import { GroupProfileDeprecated } from '..';
export declare class GroupProfileMapper {
    static mapGroupProfileDBEntryToGroupProfile(groupProfileEntry: GroupProfileEntry.SchemaMap): GroupProfileDeprecated;
    static mapGroupToGroupDBEntry(groupProfile: GroupProfileDeprecated): GroupProfileEntry.SchemaMap;
}
