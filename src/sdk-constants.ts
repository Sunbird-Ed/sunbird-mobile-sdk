export namespace ServiceConstants {
    export const SUCCESS_RESPONSE = 'successful';
    export const FAILED_RESPONSE = 'failed';
    export const VALIDATION_ERROR = 'VALIDATION_ERROR';

    export const DOWNLOAD_QUEUE = 'download_queue';

    // Key Constants for all the key value store
    export const KEY_USER_SESSION = 'session';
    export const KEY_GROUP_SESSION = 'group_session';

    export const VERSION = 'version';
    export const EXPORT_ID = 'export_id';
    export const DID = 'did';
    export const EVENTS_COUNT = 'events_count';
    export const PROFILES_COUNT = 'profiles_count';
    export const EXPORT_TYPES = 'types';
    export const EXPORT_TYPE_TELEMETRY = 'telemetry';
    export const EXPORT_TYPE_PROFILE = 'userprofile';
    export const FILE_SIZE = 'FILE_SIZE';
    export const FILE_TYPE = 'FILE_TYPE';
    export const CONTENT_ITEMS_COUNT_KEY = 'content_count';
    export const MASTER_DATA_TYPE_GENIE_CONFIG = 'genieConfig';

    export namespace Params {
        export const PROFILE_CONFIG = 'PROFILE_CONFIG';
        export const PLAYER_CONFIG = 'PLAYER_CONFIG';
        export const OAUTH_SESSION = 'OAUTH_SESSION';
    }

    export namespace BundleKey {
        // ContentPlayer
        export const BUNDLE_KEY_DOWNLOAD_REQUEST = 'download_request';
    }

    export namespace FileExtension {
        export const CONTENT = 'ecar';
        export const PROFILE = 'epar';
        export const TELEMETRY = 'gsa';
        export const APK = 'apk';
    }

    export namespace PreferenceKey {
        // Sync service pref keys
        export const LAST_SYNC_TIME = 'lastSyncTime';

        // Partner
        export const KEY_ACTIVE_PARTNER_ID = 'partner.activeid';
        export const SHARED_PREF_SESSION_KEY = 'partnersessionid';
        export const SHARED_PREF_PARTNER_SET_EPOCH = 'partnerSET';

        // Download
        export const KEY_DOWNLOAD_STATUS = 'download_status';

        // Scan Storage
        export const KEY_LAST_MODIFIED = 'last_modified';
    }

    export namespace Partner {
        export const KEY_PARTNER_ID = 'partnerid';
    }

    export namespace Event {
        export const ERROR_INVALID_EVENT = 'Invalid event';
        export const ERROR_INVALID_JSON = 'Invalid Json';
    }

    export namespace APIExecutionMode {
        export const MODE_WIFI = 'WIFI';
        export const MODE_MDATA = 'MDATA';
        //        export const MODE_LOCAL = 'LOCAL';
        export const MODE_NO_NETWORK = '';
    }

    export namespace Telemetry {
        export const CONTENT_IMPORT_INITIATED_SUB_TYPE = 'ContentImport-Initiated';
        export const CONTENT_IMPORT_SUCCESS_SUB_TYPE = 'ContentImport-Success';
        export const CONTENT_IMPORT_STAGE_ID = 'ImportContent';
        export const CONTENT_DOWNLOAD_INITIATE = 'ContentDownload-Initiate';
        export const CONTENT_DOWNLOAD_SUCCESS = 'ContentDownload-Success';
        export const CONTENT_DOWNLOAD_CANCEL = 'ContentDownload-Cancel';
        export const CONTENT_DETAIL = 'ContentDetail';

        export const CONTENT_PLAYER = 'ContentPlayer';
        export const SESSION = 'Session';
        export const OBJECT_TYPE_CONTENT = 'Content';
        export const DEFAULT_ENVIRONMENT = 'app';
        export const SDK_ENVIRONMENT = 'sdk';

        export const AUDIT_CREATED = 'Created';
        export const AUDIT_UPDATED = 'Updated';
        export const AUDIT_DELETED = 'Deleted';
        export const OBJECT_TYPE_GROUP = 'Group';
        export const OBJECT_TYPE_USER = 'User';
        export const CONTENT_PLAYER_PID = 'contentplayer';

    }

    export namespace ErrorCode {
        export const PROCESSING_ERROR = 'PROCESSING_ERROR';
        export const DATA_NOT_FOUND_ERROR = 'NO_DATA_FOUND';
        export const VALIDATION_ERROR = 'VALIDATION_ERROR';
        export const INVALID_PROFILE = 'INVALID_PROFILE';
        export const PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND';
        export const INVALID_USER = 'INVALID_USER';
        export const EXPORT_FAILED = 'EXPORT_FAILED';
        export const IMPORT_FAILED = 'IMPORT_FAILED';
        export const MOVE_FAILED = 'MOVE_FAILED';
        export const SWITCH_FAILED = 'SWITCH_FAILED';

        // Partner
        export const UNREGISTERED_PARTNER = 'UNREGISTERED_PARTNER';
        export const ENCRYPTION_FAILURE = 'ENCRYPTION_FAILURE';
        export const MISSING_PARTNER_ID = 'MISSING_PARTNER_ID';
        export const MISSING_PUBLIC_KEY = 'MISSING_PUBLIC_KEY';
        export const INVALID_RSA_PUBLIC_KEY = 'INVALID_RSA_PUBLIC_KEY';

        // Content
        export const NO_DATA_FOUND = 'NO_DATA_FOUND';
        export const INVALID_FILE = 'INVALID_FILE';
        export const ECAR_NOT_FOUND = 'ECAR_NOT_FOUND';

        // Notification
        export const ADD_FAILED = 'ADD_FAILED';
        export const DELETE_FAILED = 'DELETE_FAILED';

        // Authentication
        export const TOKEN_GENERATION_FAILED = 'TOKEN_GENERATION_FAILED';

        // KeyValueStore
        export const KEY_NOT_FOUND = 'KEY_NOT_FOUND';

        export const AUTH_SESSION = 'AUTH_SESSION';

        // Framework
        export const NO_CHANNEL_DETAILS_FOUND = 'NO_CHANNEL_DETAILS_FOUND';
        export const NO_FRAMEWORK_DETAILS_FOUND = 'NO_FRAMEWORK_DETAILS_FOUND';

        // Announcement
        export const UPDATE_ANNOUNCEMENT_FAILED = 'UPDATE_ANNOUNCEMENT_FAILED';

        // FORM
        export const NO_FORM_FOUND = 'NO_FORM_FOUND';
        export const NO_FORM_DATA_FOUND = 'NO_FORM_DATA_FOUND';

        // PAGE
        export const NO_PAGE_DATA_FOUND = 'NO_PAGE_DATA_FOUND';

        export const THRESHOLD_LIMIT_NOT_REACHED = 'OFFLINE_SYNC_THRESHOLD_LIMIT_NOT_REACHED';

        // GROUP
        export const INVALID_GROUP = 'INVALID_GROUP';
        export const GROUP_NOT_FOUND = 'GROUP_NOT_FOUND';

    }

    export namespace ErrorMessage {
        export const UNABLE_TO_FIND_PROFILE = 'Unable to find profile';
        export const UNABLE_TO_FIND_SUMMARY = 'Unable to find summary';
        export const NO_USER_WITH_SPECIFIED_ID = 'There is no user with specified id exists';

        export const MANDATORY_FIELD_CONTENT_IDENTIFIER = 'Content identifier could not be null or empty.';
        export const NO_CONTENT_LISTING_DATA = 'No data found.';

        export const UNABLE_TO_CREATE_PROFILE = 'Unable to create profile';
        export const INVALID_PROFILE = 'Invalid profile';
        export const UNABLE_TO_UPDATE_PROFILE = 'Unable to update profile';
        export const UNABLE_TO_DELETE_PROFILE = 'Unable to delete profile';
        export const UNABLE_TO_SET_CURRENT_USER = 'Unable to set current user';

        // Config
        export const UNABLE_TO_FIND_MASTER_DATA = 'Unable to find master data.';
        export const UNABLE_TO_FIND_RESOURCE_BUNDLE = 'Unable to find resource bundle.';
        export const UNABLE_TO_FIND_ORDINALS = 'Unable to find ordinals.';

        // Tag
        export const TAG_NAME_SHOULD_NOT_BE_EMPTY = 'Tag name can\'t be null or empty.';
        export const UNABLE_TO_FIND_TAG = 'Tag name not found.';

        // Sync
        export const UNABLE_TO_SYNC = 'Sync Failed.';

        // Telemetry
        export const UNABLE_TO_SAVE_EVENT = 'Not able to save event';

        // Import
        export const IMPORT_PROFILE_FAILED = 'Import profile failed.';
        export const IMPORT_TELEMETRY_FAILED = 'Import telemetry failed.';
        export const FILE_DOES_NOT_EXIST = 'Content import failed, file doesn\'t exist.';
        export const UNSUPPORTED_FILE = 'Content import failed, unsupported file extension';
        export const CONTENT_NOT_FOUND = 'No content found for identifier = ';
        export const NO_CONTENT_TO_EXPORT = 'Nothing to export!';

        export const FAILED_TO_DELETE_NOTIFICATION = 'Failed to delete notification';
        export const FAILED_TO_ADD_UPDATE_NOTIFICATION = 'Failed to add/update  notification';

        // Authentication
        export const FAILED_TO_GENERATE_TOKEN = 'Failed to generate the bearer token';

        // KeyStore Value
        export const UNABLE_TO_FIND_KEY = 'Unable to find key';

        export const NOT_WRITABLE = 'Destination folder is not writable.';
        export const NO_CONTENT_TO_MOVE = 'Nothing to move.';

        export const USER_NOT_SIGN_IN = 'User is not sign in.';

        // Framework
        export const UNABLE_TO_FIND_CHANNEL_DETAILS = 'Unable to find channel details';
        export const UNABLE_TO_FIND_FRAMEWORK_DETAILS = 'Unable to find framework details';
        export const UNABLE_TO_UPDATE_ANNOUNCEMENT = 'Unable to update announcement';
        export const UNABLE_TO_FIND_FORM = 'Unable to find form';
        export const UNABLE_TO_FIND_FORM_DATA = 'Unable to find form data';

        // Page
        export const UNABLE_TO_FIND_PAGE = 'Unable to find page';
        export const UNABLE_TO_FIND_PAGE_DATA = 'Unable to find page data';

        export const THRESHOLD_LIMIT_NOT_REACHED = 'Offline Threshold limit not reached';

        // Group
        export const INVALID_GROUP = 'Invalid group';
        export const UNABLE_TO_CREATE_GROUP = 'Unable to create group';
        export const UNABLE_TO_FIND_GROUP = 'Unable to find group';
        export const UNABLE_TO_UPDATE_GROUP = 'Unable to update group';
        export const UNABLE_TO_UPDATE_GROUP_USER = 'Unable to update group or users';
        export const NO_GROUP_WITH_SPECIFIED_ID = 'There is no group with specified id exists';
        export const UNABLE_TO_SET_CURRENT_GROUP = 'Unable to set current group';

    }

    export namespace SuccessMessage {
        export const SCAN_SUCCESS_NO_CHANGES = 'Scan success no changes available';
        export const SCAN_SUCCESS_WITH_CHANGES = 'Scan success and changes available';
    }
}
