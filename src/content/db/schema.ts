import {DbConstants} from '../../db';


export namespace ContentEntry {
    export const TABLE_NAME = 'content';
    export const _ID = '_id';
    export const COLUMN_NAME_IDENTIFIER = 'identifier';
    export const COLUMN_NAME_SERVER_DATA = 'server_data';
    export const COLUMN_NAME_LOCAL_DATA = 'local_data';
    export const COLUMN_NAME_MIME_TYPE = 'mime_type';
    export const COLUMN_NAME_PATH = 'path';
    export const COLUMN_NAME_INDEX = 'search_index';
    export const COLUMN_NAME_VISIBILITY = 'visibility';   // Visibility could be Default or Parent
    export const COLUMN_NAME_SERVER_LAST_UPDATED_ON = 'server_last_updated_on';
    export const COLUMN_NAME_LOCAL_LAST_UPDATED_ON = 'local_last_updated_on';
    export const COLUMN_NAME_MANIFEST_VERSION = 'manifest_version';
    export const COLUMN_NAME_REF_COUNT = 'ref_count';
    export const COLUMN_NAME_CONTENT_STATE = 'content_state'; // 0 - Seen but not available (only serverData will be available),
    // 1 - Only spine, 2 - Artifact available
    export const COLUMN_NAME_CONTENT_TYPE = 'content_type';   // Content type could be story,
    // worksheet, game, collection, textbook.
    export const COLUMN_NAME_AUDIENCE = 'audience';   // learner, instructor
    export const COLUMN_NAME_PRAGMA = 'pragma';   // external, ads
    export const COLUMN_NAME_UID = 'uid';   // list of comma separated uid
    export const COLUMN_NAME_SIZE_ON_DEVICE = 'size_on_device';   // list of comma separated uid
    export const COLUMN_NAME_BOARD = 'board';
    export const COLUMN_NAME_MEDIUM = 'medium';
    export const COLUMN_NAME_GRADE = 'grade';
    export const COLUMN_NAME_DIALCODES = 'dialcodes';
    export const COLUMN_NAME_CHILD_NODES = 'child_nodes';
    export const COLUMN_NAME_PRIMARY_CATEGORY = 'primary_category';

    export interface SchemaMap {
        [COLUMN_NAME_IDENTIFIER]: string;
        [COLUMN_NAME_SERVER_DATA]: string;
        [COLUMN_NAME_LOCAL_DATA]: string;
        [COLUMN_NAME_MIME_TYPE]: string;
        [COLUMN_NAME_PATH]?: string;
        [COLUMN_NAME_INDEX]?: string;
        [COLUMN_NAME_VISIBILITY]?: string;
        [COLUMN_NAME_SERVER_LAST_UPDATED_ON]?: string;
        [COLUMN_NAME_LOCAL_LAST_UPDATED_ON]?: string;
        [COLUMN_NAME_MANIFEST_VERSION]: string;
        [COLUMN_NAME_REF_COUNT]?: number;
        [COLUMN_NAME_CONTENT_STATE]?: number;
        [COLUMN_NAME_CONTENT_TYPE]: string;
        [COLUMN_NAME_AUDIENCE]?: string;
        [COLUMN_NAME_PRAGMA]?: string;
        [COLUMN_NAME_SIZE_ON_DEVICE]?: number;
        [COLUMN_NAME_BOARD]?: string;
        [COLUMN_NAME_MEDIUM]?: string;
        [COLUMN_NAME_GRADE]?: string;
        [COLUMN_NAME_DIALCODES]?: string;
        [COLUMN_NAME_CHILD_NODES]?: string;
        [COLUMN_NAME_PRIMARY_CATEGORY]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME + ' (' +
            ContentEntry._ID + ' INTEGER PRIMARY KEY,' +
            COLUMN_NAME_IDENTIFIER + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' UNIQUE NOT NULL' + DbConstants.COMMA_SEP +
            COLUMN_NAME_SERVER_DATA + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_LOCAL_DATA + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_MIME_TYPE + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_PATH + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_INDEX + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_VISIBILITY + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_SERVER_LAST_UPDATED_ON + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_LOCAL_LAST_UPDATED_ON + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_REF_COUNT + DbConstants.SPACE + DbConstants.INT_TYPE + ' NOT NULL DEFAULT 1' + DbConstants.COMMA_SEP +
            COLUMN_NAME_CONTENT_STATE + DbConstants.SPACE + DbConstants.INT_TYPE + ' NOT NULL DEFAULT 2' + DbConstants.COMMA_SEP +
            COLUMN_NAME_CONTENT_TYPE + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_AUDIENCE + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' DEFAULT \'Learner\'' + DbConstants.COMMA_SEP +
            COLUMN_NAME_SIZE_ON_DEVICE + DbConstants.SPACE + DbConstants.INT_TYPE + ' NOT NULL DEFAULT 0' + DbConstants.COMMA_SEP +
            COLUMN_NAME_PRAGMA + DbConstants.SPACE + DbConstants.TEXT_TYPE + '  DEFAULT \'\'' + DbConstants.COMMA_SEP +
            COLUMN_NAME_BOARD + DbConstants.SPACE + DbConstants.TEXT_TYPE + '  DEFAULT \'\'' + DbConstants.COMMA_SEP +
            COLUMN_NAME_MEDIUM + DbConstants.SPACE + DbConstants.TEXT_TYPE + '  DEFAULT \'\'' + DbConstants.COMMA_SEP +
            COLUMN_NAME_GRADE + DbConstants.SPACE + DbConstants.TEXT_TYPE + '  DEFAULT \'\'' + DbConstants.COMMA_SEP +
            COLUMN_NAME_MANIFEST_VERSION + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_DIALCODES + DbConstants.SPACE + DbConstants.TEXT_TYPE + '  DEFAULT \'\'' + DbConstants.COMMA_SEP +
            COLUMN_NAME_CHILD_NODES + DbConstants.SPACE + DbConstants.TEXT_TYPE + '  DEFAULT \'\'' + DbConstants.COMMA_SEP +
            COLUMN_NAME_PRIMARY_CATEGORY + DbConstants.SPACE + DbConstants.TEXT_TYPE + '  DEFAULT \'\'' +
            ' )';
    };

    export const getDeleteEntry: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TABLE_NAME;
    };

    export const getAlterEntryForContentSize: (() => string) = () => {
        return 'ALTER TABLE ' + TABLE_NAME + ' ADD COLUMN ' + COLUMN_NAME_SIZE_ON_DEVICE + DbConstants.INT_TYPE + ' NOT NULL DEFAULT 0;';
    };

    export const getAlterEntryForPragma: (() => string) = () => {
        return 'ALTER TABLE ' + TABLE_NAME + ' ADD COLUMN ' + COLUMN_NAME_PRAGMA + DbConstants.TEXT_TYPE + ' DEFAULT \'\';';
    };


    export const getAlterEntryForBoard: (() => string) = () => {
        return `ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME_BOARD} TEXT DEFAULT ''`;
    };

    export const getAlterEntryForMedium: (() => string) = () => {
        return `ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME_MEDIUM} TEXT DEFAULT ''`;
    };

    export const getAlterEntryForGrade: (() => string) = () => {
        return `ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME_GRADE} TEXT DEFAULT ''`;
    };

    export const getAlterEntryForDialCode: (() => string) = () => {
        return `ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME_DIALCODES} TEXT DEFAULT ''`;
    };

    export const getAlterEntryForChildNodes: (() => string) = () => {
        return `ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME_CHILD_NODES} TEXT DEFAULT ''`;
    };

    export const getAlterEntryForPrimaryCategory: (() => string) = () => {
        return `ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME_PRIMARY_CATEGORY} TEXT DEFAULT ''`;
    };
}

export namespace ContentAccessEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'content_access';
    export const COLUMN_NAME_UID = 'uid';
    export const COLUMN_NAME_CONTENT_IDENTIFIER = 'identifier';
    export const COLUMN_NAME_EPOCH_TIMESTAMP = 'epoch_timestamp';
    export const COLUMN_NAME_STATUS = 'status'; // viewed = 1, partiallyPlayed = 2, fullyPlayed = 3
    export const COLUMN_NAME_CONTENT_TYPE = 'content_type';
    export const COLUMN_NAME_LEARNER_STATE = 'learner_state';
    export const COLUMN_NAME_PRIMARY_CATEGORY = 'primary_category';

    export interface SchemaMap {
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_CONTENT_IDENTIFIER]: string;
        [COLUMN_NAME_EPOCH_TIMESTAMP]: number;
        [COLUMN_NAME_STATUS]: number;
        [COLUMN_NAME_CONTENT_TYPE]: string;
        [COLUMN_NAME_LEARNER_STATE]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME + ' (' +
            _ID + ' INTEGER PRIMARY KEY,' +
            COLUMN_NAME_UID + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' NOT NULL' + DbConstants.COMMA_SEP +
            COLUMN_NAME_CONTENT_IDENTIFIER + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_EPOCH_TIMESTAMP + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_STATUS + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_CONTENT_TYPE + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_LEARNER_STATE + DbConstants.SPACE + DbConstants.BLOB_TYPE +
            ' )';
    };

    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TABLE_NAME;
    };

    export const getAlterEntryForPrimaryCategory: (() => string) = () => {
        return `ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME_PRIMARY_CATEGORY} TEXT DEFAULT ''`;
    };
}

export namespace ContentFeedbackEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'feedback';
    export const COLUMN_NAME_CONTENT_ID = 'identifier';
    export const COLUMN_NAME_UID = 'uid';
    export const COLUMN_NAME_RATING = 'rating';
    export const COLUMN_NAME_COMMENTS = 'comments';
    export const COLUMN_NAME_CREATED_AT = 'createdAt';

    export interface SchemaMap {
        [COLUMN_NAME_CONTENT_ID]: string;
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_RATING]: number;
        [COLUMN_NAME_COMMENTS]: string;
        [COLUMN_NAME_CREATED_AT]: number;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME + ' (' +
            _ID + ' INTEGER PRIMARY KEY,' +
            COLUMN_NAME_CONTENT_ID + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' NOT NULL' + DbConstants.COMMA_SEP +
            COLUMN_NAME_UID + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' NOT NULL' + DbConstants.COMMA_SEP +
            COLUMN_NAME_RATING + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' NOT NULL' + DbConstants.COMMA_SEP +
            COLUMN_NAME_COMMENTS + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' NOT NULL' + DbConstants.COMMA_SEP +
            COLUMN_NAME_CREATED_AT + DbConstants.SPACE + DbConstants.INT_TYPE +
            ' )';
    };

    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TABLE_NAME;
    };
}


export namespace ContentMarkerEntry {

    export const _ID = '_id';
    export const TABLE_NAME = 'content_marker';
    export const COLUMN_NAME_UID = 'uid';
    export const COLUMN_NAME_CONTENT_IDENTIFIER = 'identifier';
    export const COLUMN_NAME_EPOCH_TIMESTAMP = 'epoch_timestamp';
    export const COLUMN_NAME_DATA = 'data';
    export const COLUMN_NAME_EXTRA_INFO = 'extra_info';
    export const COLUMN_NAME_MARKER = 'marker';
    export const COLUMN_NAME_MIME_TYPE = 'mime_type';

    export interface SchemaMap {
        [COLUMN_NAME_UID]: string;
        [COLUMN_NAME_CONTENT_IDENTIFIER]: string;
        [COLUMN_NAME_EPOCH_TIMESTAMP]: number;
        [COLUMN_NAME_DATA]: string;
        [COLUMN_NAME_EXTRA_INFO]: string;
        [COLUMN_NAME_MARKER]: number;
        [COLUMN_NAME_MIME_TYPE]: string;
    }

    export const getCreateEntry: (() => string) = () => {
        return 'CREATE TABLE IF NOT EXISTS ' + ContentMarkerEntry.TABLE_NAME + ' (' +
            ContentMarkerEntry._ID + ' INTEGER PRIMARY KEY,' +
            COLUMN_NAME_UID + DbConstants.SPACE + DbConstants.TEXT_TYPE + ' NOT NULL' + DbConstants.COMMA_SEP +
            COLUMN_NAME_CONTENT_IDENTIFIER + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_EPOCH_TIMESTAMP + DbConstants.SPACE + DbConstants.INT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_DATA + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_EXTRA_INFO + DbConstants.SPACE + DbConstants.TEXT_TYPE + DbConstants.COMMA_SEP +
            COLUMN_NAME_MIME_TYPE + DbConstants.SPACE + DbConstants.TEXT_TYPE + '  DEFAULT \'\'' + DbConstants.COMMA_SEP +
            COLUMN_NAME_MARKER + DbConstants.SPACE + DbConstants.INT_TYPE +
            ' )';
    };

    export const deleteTable: (() => string) = () => {
        return 'DROP TABLE IF EXISTS ' + TABLE_NAME;
    };

    export const getAlterEntryForMimeType: (() => string) = () => {
        return `ALTER TABLE ${TABLE_NAME} ADD COLUMN ${COLUMN_NAME_MIME_TYPE} TEXT DEFAULT ''`;
    };
}
