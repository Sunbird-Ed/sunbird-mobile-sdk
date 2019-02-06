import { GroupProfileEntry } from '../db/schema';
import { GroupProfile } from '../def/group';
export declare class GroupProfileMapper {
    static mapGroupProfileDBEntryToGroupProfile(groupProfileEntry: GroupProfileEntry.SchemaMap): GroupProfile;
    static mapGroupToGroupDBEntry(groupProfile: GroupProfile): GroupProfileEntry.SchemaMap;
}
