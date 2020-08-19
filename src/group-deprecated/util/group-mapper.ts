import {GroupEntry} from '../db/schema';
import {GroupDeprecated} from '..';

export class GroupMapper {
    public static mapGroupDBEntryToGroup(groupEntry: GroupEntry.SchemaMap): GroupDeprecated {
        return {
            gid: groupEntry[GroupEntry.COLUMN_NAME_GID],
            name: groupEntry[GroupEntry.COLUMN_NAME_NAME],
            syllabus: groupEntry[GroupEntry.COLUMN_NAME_SYLLABUS].split(','),
            grade: groupEntry[GroupEntry.COLUMN_NAME_GRADE].split(','),
            gradeValue: JSON.parse(groupEntry[GroupEntry.COLUMN_NAME_GRADE_VALUE]),
            createdAt: groupEntry[GroupEntry.COLUMN_NAME_CREATED_AT],
            updatedAt: groupEntry[GroupEntry.COLUMN_NAME_UPDATED_AT]
        };
    }

    public static mapGroupToGroupDBEntry(group: GroupDeprecated): GroupEntry.SchemaMap {
        return {
            [GroupEntry.COLUMN_NAME_GID]: group.gid,
            [GroupEntry.COLUMN_NAME_SYLLABUS]: (group.syllabus ? group.syllabus.join(',') : ''),
            [GroupEntry.COLUMN_NAME_GRADE]: (group.grade ? group.grade.join(',') : ''),
            [GroupEntry.COLUMN_NAME_NAME]: group.name,
            [GroupEntry.COLUMN_NAME_GRADE_VALUE]: JSON.stringify(group.gradeValue),
            [GroupEntry.COLUMN_NAME_CREATED_AT]: group.createdAt,
            [GroupEntry.COLUMN_NAME_UPDATED_AT]: group.updatedAt
        };
    }

}
