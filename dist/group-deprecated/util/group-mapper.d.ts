import { GroupEntry } from '../db/schema';
import { GroupDeprecated } from '..';
export declare class GroupMapper {
    static mapGroupDBEntryToGroup(groupEntry: GroupEntry.SchemaMap): GroupDeprecated;
    static mapGroupToGroupDBEntry(group: GroupDeprecated): GroupEntry.SchemaMap;
}
