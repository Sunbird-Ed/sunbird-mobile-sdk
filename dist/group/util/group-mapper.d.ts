import { GroupEntry } from '../../group/db/schema';
import { Group } from '..';
export declare class GroupMapper {
    static mapGroupDBEntryToGroup(groupEntry: GroupEntry.SchemaMap): Group;
    static mapGroupToGroupDBEntry(group: Group): GroupEntry.SchemaMap;
}
