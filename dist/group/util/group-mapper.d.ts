import { GroupEntry } from '../../profile/db/schema';
import { Group } from '../../profile/def/group';
export declare class GroupMapper {
    static mapGroupDBEntryToGroup(groupEntry: GroupEntry.SchemaMap): Group;
    static mapGroupToGroupDBEntry(group: Group): GroupEntry.SchemaMap;
}
