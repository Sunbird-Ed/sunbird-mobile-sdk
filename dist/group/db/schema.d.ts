export declare namespace GroupProfileEntry {
    const TABLE_NAME = "group_profile";
    const _ID = "_id";
    const COLUMN_NAME_UID = "uid";
    const COLUMN_NAME_GID = "gid";
    const COLUMN_NAME_EPOCH_TIMESTAMP = "epoch_timestamp";
    interface SchemaMap {
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_GID]: string;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
}
export declare namespace GroupEntry {
    const TABLE_NAME = "groups";
    const _ID = "_id";
    const COLUMN_NAME_GID = "gid";
    const COLUMN_NAME_NAME = "name";
    const COLUMN_NAME_SYLLABUS = "syllabus";
    const COLUMN_NAME_GRADE = "grade";
    const COLUMN_NAME_GRADE_VALUE = "grade_value";
    const COLUMN_NAME_CREATED_AT = "created_at";
    const COLUMN_NAME_UPDATED_AT = "updated_at";
    interface SchemaMap {
        [COLUMN_NAME_GID]: string;
        [COLUMN_NAME_NAME]: string;
        [COLUMN_NAME_SYLLABUS]: string;
        [COLUMN_NAME_GRADE]: string;
        [COLUMN_NAME_GRADE_VALUE]: string;
        [COLUMN_NAME_CREATED_AT]: number;
        [COLUMN_NAME_UPDATED_AT]: number;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
}
