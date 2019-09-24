export declare namespace CourseAssessmentEntry {
    const TABLE_NAME = "course_assessment";
    const _ID = "_id";
    const COLUMN_NAME_ASSESSMENT_EVENT = "assessment_event";
    const COLUMN_NAME_CREATED_AT = "created_at";
    const COLUMN_NAME_USER_ID = "user_id";
    const COLUMN_NAME_CONTENT_ID = "content_id";
    const COLUMN_NAME_COURSE_ID = "course_id";
    const COLUMN_NAME_BATCH_ID = "batch_id";
    interface SchemaMap {
        [_ID]: number;
        [COLUMN_NAME_ASSESSMENT_EVENT]: string;
        [COLUMN_NAME_CREATED_AT]: number;
        [COLUMN_NAME_USER_ID]: string;
        [COLUMN_NAME_CONTENT_ID]: string;
        [COLUMN_NAME_COURSE_ID]: string;
        [COLUMN_NAME_BATCH_ID]: string;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
}
