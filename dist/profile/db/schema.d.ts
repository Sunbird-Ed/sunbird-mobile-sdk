export declare namespace ProfileEntry {
    const _ID = "_id";
    const TABLE_NAME = "profiles";
    const COLUMN_NAME_UID = "uid";
    const COLUMN_NAME_HANDLE = "handle";
    const COLUMN_NAME_AVATAR = "avatar";
    const COLUMN_NAME_AGE = "age";
    const COLUMN_NAME_GENDER = "gender";
    const COLUMN_NAME_STANDARD = "standard";
    const COLUMN_NAME_LANGUAGE = "language";
    const COLUMN_NAME_DAY = "day";
    const COLUMN_NAME_MONTH = "month";
    const COLUMN_NAME_IS_GROUP_USER = "is_group_user";
    const COLUMN_NAME_CREATED_AT = "created_at";
    const COLUMN_NAME_MEDIUM = "medium";
    const COLUMN_NAME_BOARD = "board";
    const COLUMN_NAME_PROFILE_IMAGE = "profile_image";
    const COLUMN_NAME_SUBJECT = "subject";
    const COLUMN_NAME_PROFILE_TYPE = "profile_type";
    const COLUMN_NAME_GRADE = "grade";
    const COLUMN_NAME_SYLLABUS = "syllabus";
    const COLUMN_NAME_SOURCE = "source";
    const COLUMN_NAME_GRADE_VALUE = "grade_value";
    const COLUMN_VALUE = "value";
    interface SchemaMap {
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_HANDLE]: string;
        [COLUMN_NAME_CREATED_AT]: number;
        [COLUMN_NAME_MEDIUM]: string;
        [COLUMN_NAME_BOARD]: string;
        [COLUMN_NAME_SUBJECT]: string;
        [COLUMN_NAME_PROFILE_TYPE]: string;
        [COLUMN_NAME_GRADE]: string;
        [COLUMN_NAME_SYLLABUS]: string;
        [COLUMN_NAME_SOURCE]: string;
        [COLUMN_NAME_GRADE_VALUE]: string;
    }
    const getCreateEntry: () => string;
    const deleteTable: (() => string);
    const getAlterEntryForProfileSyllabus: (() => string);
}
export declare namespace UserEntry {
    const _ID = "_id";
    const TABLE_NAME = "users";
    const COLUMN_NAME_UID = "uid";
    interface SchemaMap {
        [COLUMN_NAME_UID]: string;
    }
    const getCreateEntry: (() => string);
    const deleteTable: (() => string);
}
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
export declare namespace ImportedMetadataEntry {
    const _ID = "_id";
    const TABLE_NAME = "imported_metadata";
    const COLUMN_NAME_IMPORTED_ID = "imported_id";
    const COLUMN_NAME_DEVICE_ID = "device_id";
    const COLUMN_NAME_COUNT = "count";
    interface SchemaMap {
        [COLUMN_NAME_IMPORTED_ID]: string;
        [COLUMN_NAME_DEVICE_ID]: string;
        [COLUMN_NAME_COUNT]: string;
    }
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
}
export declare namespace LearnerAssessmentsEntry {
    const _ID = "_id";
    const TABLE_NAME = "learner_assessments";
    const COLUMN_NAME_UID = "uid";
    const COLUMN_NAME_CONTENT_ID = "content_id";
    const COLUMN_NAME_QID = "qid";
    const COLUMN_NAME_Q_INDEX = "qindex";
    const COLUMN_NAME_CORRECT = "correct";
    const COLUMN_NAME_SCORE = "score";
    const COLUMN_NAME_MAX_SCORE = "max_score";
    const COLUMN_NAME_TIME_SPENT = "time_spent";
    const COLUMN_NAME_RES = "res";
    const COLUMN_NAME_TIMESTAMP = "timestamp";
    const COLUMN_NAME_Q_DESC = "qdesc";
    const COLUMN_NAME_Q_TITLE = "qtitle";
    const COLUMN_NAME_HIERARCHY_DATA = "h_data";
    const COLUMN_NAME_TOTAL_TS = "total_ts";
    const COLUMN_NAME_MARKS = "marks";
    const COLUMN_NAME_COUNT = "occurence_count";
    const COLUMN_NAME_TOTAL_MAX_SCORE = "sum_max_score";
    const COLUMN_NAME_USERS_COUNT = "users_count";
    const COLUMN_NAME_HANDLE = "handle";
    interface SchemaMap {
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_CONTENT_ID]: string;
        [COLUMN_NAME_QID]: string;
        [COLUMN_NAME_Q_INDEX]: number;
        [COLUMN_NAME_CORRECT]: number;
        [COLUMN_NAME_SCORE]: number;
        [COLUMN_NAME_MAX_SCORE]: number;
        [COLUMN_NAME_TIME_SPENT]: number;
        [COLUMN_NAME_RES]: string;
        [COLUMN_NAME_TIMESTAMP]: number;
        [COLUMN_NAME_Q_DESC]: string;
        [COLUMN_NAME_Q_TITLE]: string;
        [COLUMN_NAME_HIERARCHY_DATA]: string;
    }
    interface QuestionReportsSchema extends SchemaMap {
        [COLUMN_NAME_MARKS]: number;
        [COLUMN_NAME_COUNT]: number;
        [COLUMN_NAME_TOTAL_MAX_SCORE]: number;
    }
    interface AccuracySchema {
        [COLUMN_NAME_QID]: string;
        [COLUMN_NAME_USERS_COUNT]: number;
    }
    interface UserReportSchema {
        [COLUMN_NAME_TOTAL_TS]: number;
        [COLUMN_NAME_SCORE]: number;
        [COLUMN_NAME_HIERARCHY_DATA]: string;
        [COLUMN_NAME_CONTENT_ID]: string;
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_HANDLE]: string;
        [COLUMN_NAME_TIME_SPENT]: number;
    }
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
}
export declare namespace LearnerSummaryEntry {
    const _ID = "_id";
    const TABLE_NAME = "learner_content_summary";
    const COLUMN_NAME_UID = "uid";
    const COLUMN_NAME_CONTENT_ID = "content_id";
    const COLUMN_NAME_AVG_TS = "avg_ts";
    const COLUMN_NAME_SESSIONS = "sessions";
    const COLUMN_NAME_TOTAL_TS = "total_ts";
    const COLUMN_NAME_LAST_UPDATED_ON = "last_updated_on";
    const COLUMN_NAME_HIERARCHY_DATA = "h_data";
    const COLUMN_NAME_NO_OF_QUESTIONS = "no_of_questions";
    const COLUMN_NAME_CORRECT_ANSWERS = "correct_answers";
    const COLUMN_NAME_TOTAL_TIME_SPENT = "total_time_spent";
    const COLUMN_NAME_TOTAL_MAX_SCORE = "total_max_score";
    const COLUMN_NAME_TOTAL_SCORE = "total_score";
    interface SchemaMap {
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_CONTENT_ID]: string;
        [COLUMN_NAME_AVG_TS]: number;
        [COLUMN_NAME_SESSIONS]?: number;
        [COLUMN_NAME_TOTAL_TS]: number;
        [COLUMN_NAME_LAST_UPDATED_ON]: number;
        [COLUMN_NAME_HIERARCHY_DATA]: string;
        [COLUMN_NAME_NO_OF_QUESTIONS]?: number;
        [COLUMN_NAME_CORRECT_ANSWERS]?: number;
        [COLUMN_NAME_TOTAL_TIME_SPENT]?: number;
        [COLUMN_NAME_TOTAL_MAX_SCORE]?: number;
        [COLUMN_NAME_TOTAL_SCORE]?: number;
    }
    const getCreateEntry: (() => string);
    const getDeleteEntry: (() => string);
}
