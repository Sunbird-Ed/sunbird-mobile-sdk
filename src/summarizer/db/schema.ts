import {DbConstants} from '../../db';

export namespace CourseAssessmentEntry {
    export const TABLE_NAME = 'course_assessment';
    export const _ID = '_id';
    export const COLUMN_NAME_ASSESSMENT_EVENT = 'assessment_event';
    export const COLUMN_NAME_CREATED_AT = 'created_at';

    export const COLUMN_NAME_USER_ID = 'user_id';
    export const COLUMN_NAME_CONTENT_ID = 'content_id';
    export const COLUMN_NAME_COURSE_ID = 'course_id';
    export const COLUMN_NAME_BATCH_ID = 'batch_id';

    export interface SchemaMap {
        [_ID]: number;
        [COLUMN_NAME_ASSESSMENT_EVENT]: string;
        [COLUMN_NAME_CREATED_AT]: number;

        [COLUMN_NAME_USER_ID]: string;
        [COLUMN_NAME_CONTENT_ID]: string;
        [COLUMN_NAME_COURSE_ID]: string;
        [COLUMN_NAME_BATCH_ID]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS' + DbConstants.SPACE + CourseAssessmentEntry.TABLE_NAME + DbConstants.SPACE + '(' +
            CourseAssessmentEntry._ID + DbConstants.SPACE + 'INTEGER PRIMARY KEY,' +
            CourseAssessmentEntry.COLUMN_NAME_ASSESSMENT_EVENT + DbConstants.SPACE + DbConstants.TEXT_TYPE + ',' +
            CourseAssessmentEntry.COLUMN_NAME_CREATED_AT + DbConstants.SPACE + DbConstants.INT_TYPE + ',' +
            CourseAssessmentEntry.COLUMN_NAME_USER_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + ',' +
            CourseAssessmentEntry.COLUMN_NAME_CONTENT_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + ',' +
            CourseAssessmentEntry.COLUMN_NAME_COURSE_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + ',' +
            CourseAssessmentEntry.COLUMN_NAME_BATCH_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + ')';
    };

    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS' + CourseAssessmentEntry.TABLE_NAME;
    };
}
