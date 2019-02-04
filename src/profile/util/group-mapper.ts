import {GroupEntry} from '../db/schema';
import {Group} from '../def/group';

export class GroupMapper {
    public static mapGroupDBEntryToGroup(groupEntry: GroupEntry.SchemaMap): Group {
        return {
            gid: JSON.parse(groupEntry[GroupEntry.COLUMN_NAME_GID]),
            name: JSON.parse(groupEntry[GroupEntry.COLUMN_NAME_NAME]),
            syllabus: JSON.parse(groupEntry[GroupEntry.COLUMN_NAME_SYLLABUS]),
            grade: JSON.parse(groupEntry[GroupEntry.COLUMN_NAME_GRADE]),
            gradeValueMap: JSON.parse(groupEntry[GroupEntry.COLUMN_NAME_GRADE_VALUE]),
            createdAt: groupEntry[GroupEntry.COLUMN_NAME_CREATED_AT],
            updatedAt: groupEntry[GroupEntry.COLUMN_NAME_UPDATED_AT]
        };
    }

    public static mapGroupToGroupDBEntry(group: Group): GroupEntry.SchemaMap {
        return {
            [GroupEntry.COLUMN_NAME_GID]: JSON.stringify(group.gid),
            [GroupEntry.COLUMN_NAME_NAME]: JSON.stringify(group.name),
            [GroupEntry.COLUMN_NAME_SYLLABUS]: JSON.stringify(group.syllabus),
            [GroupEntry.COLUMN_NAME_GRADE]: JSON.stringify(group.grade),
            [GroupEntry.COLUMN_NAME_GRADE_VALUE]: JSON.stringify(group.gradeValueMap),
            [GroupEntry.COLUMN_NAME_CREATED_AT]: group.createdAt,
            [GroupEntry.COLUMN_NAME_UPDATED_AT]: group.updatedAt
        };
    }

}
