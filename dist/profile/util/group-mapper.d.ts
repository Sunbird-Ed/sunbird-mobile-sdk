import { GroupEntry } from '../db/schema';
import { Group } from '../def/group';
export declare class GroupMapper {
    static mapGroupDBEntryToGroup(groupEntry: GroupEntry.SchemaMap): Group;
    static mapGroupToGroupDBEntry(group: Group): GroupEntry.SchemaMap;
}
