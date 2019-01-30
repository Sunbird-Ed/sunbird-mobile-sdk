export declare class Workflows {
    static readonly APP: string;
    static readonly SESSION: string;
    static readonly QR: string;
}
export declare class Environment {
    static readonly HOME: string;
    static readonly COURSE: string;
    static readonly LIBRARY: string;
    static readonly USER: string;
    static readonly SETTINGS: string;
    static readonly ONBOARDING: string;
}
export declare class ObjectType {
    static readonly NOTIFICATION: string;
    static readonly USER: string;
    static readonly GROUP: string;
    static readonly CONTENT: string;
    static readonly QUESTION: string;
}
export declare class Mode {
    static readonly PLAY: string;
}
export declare class PageId {
    static readonly SPLASH_SCREEN: string;
    static readonly LOGIN: string;
    static readonly LOGOUT: string;
    static readonly SIGNUP: string;
    static readonly ONBOARDING: string;
    static readonly USER_TYPE_SELECTION: string;
    static readonly HOME: string;
    static readonly COURSES: string;
    static readonly LIBRARY: string;
    static readonly GROUPS: string;
    static readonly PROFILE: string;
    static readonly COURSE_PAGE_FILTER: string;
    static readonly LIBRARY_PAGE_FILTER: string;
    static readonly COURSE_DETAIL: string;
    static readonly COLLECTION_DETAIL: string;
    static readonly CONTENT_DETAIL: string;
    static readonly SHARE_CONTENT: string;
    static readonly FLAG_CONTENT: string;
    static readonly CONTENT_RATING: string;
    static readonly ANNOUNCEMENT_LIST: string;
    static readonly ANNOUNCEMENT_DETAIL: string;
    static readonly SHARE_ANNOUCEMENT: string;
    static readonly QRCodeScanner: string;
    static readonly SERVER_NOTIFICATION: string;
    static readonly LOCAL_NOTIFICATION: string;
    static readonly NOTIFICATION_LIST: string;
    static readonly SIGNIN_OVERLAY: string;
    static readonly SETTINGS: string;
    static readonly SETTINGS_LANGUAGE: string;
    static readonly SETTINGS_DATASYNC: string;
    static readonly SETTINGS_DEVICE_TAGS: string;
    static readonly SETTINGS_SUPPORTS: string;
    static readonly SETTINGS_ABOUT_US: string;
    static readonly ABOUT_APP: string;
    static readonly USERS_GROUPS: string;
    static readonly CREATE_USER: string;
    static readonly CREATE_GROUP: string;
    static readonly CREATE_GROUP_SYLLABUS_CLASS: string;
    static readonly CREATE_GROUP_USER_SELECTION: string;
    static readonly GROUP_DETAIL: string;
    static readonly GUEST_PROFILE: string;
    static readonly EDIT_USER: string;
    static readonly EDIT_GROUP: string;
    static readonly ADD_GROUP_SYLLABUS_CLASS: string;
    static readonly ADD_GROUP_USER_SELECTION: string;
    static readonly REMOVE_USERS_FROM_GROUP: string;
    static readonly SHARE_USER_GROUP: string;
    static readonly REPORTS_USER_GROUP: string;
    static readonly REPORTS_ASSESMENT_CONTENT_LIST: string;
    static readonly REPORTS_USER_ASSESMENT_DETAILS: string;
    static readonly REPORTS_GROUP_ASSESMENT_DETAILS: string;
    static readonly ONBOARDING_LANGUAGE_SETTING: string;
    static readonly VIEW_MORE: string;
    static readonly DIAL_CODE_SCAN_RESULT: string;
    static readonly ONBOARDING_PROFILE_PREFERENCES: string;
    static readonly ONBOARDING_QR_SHOWCASE: string;
    static readonly SEARCH: string;
    static readonly DOWNLOAD_SPINE: string;
    static readonly DIAL_NOT_LINKED: string;
    static readonly DIAL_LINKED_NO_CONTENT: string;
    static readonly TERMS_N_CONDITIONS: string;
    static readonly TERMS_N_CONDITIONS_STATIC_PAGE: string;
}
export declare class LogType {
    static readonly NOTIFICATION: string;
}
export declare class LogLevel {
    static readonly TRACE: string;
    static readonly DEBUG: string;
    static readonly INFO: string;
    static readonly WARN: string;
    static readonly ERROR: string;
    static readonly FATAL: string;
}
export declare class LogMessage {
    static readonly RECEIVED: string;
    static readonly DISPLAYED: string;
}
export declare class ImpressionType {
    static readonly SEARCH: string;
    static readonly LIST: string;
    static readonly DETAIL: string;
    static readonly VIEW: string;
    static readonly EDIT: string;
    static readonly WORKFLOW: string;
}
export declare class ImpressionSubtype {
    static readonly QRCodeScanInitiate: string;
    static readonly RATING_POPUP: string;
}
export declare class InteractType {
    static readonly TOUCH: string;
    static readonly OTHER: string;
}
export declare class InteractSubtype {
    static readonly LOGIN_INITIATE: string;
    static readonly LOGIN_SUCCESS: string;
    static readonly SIGNUP_INITIATE: string;
    static readonly LOGOUT_INITIATE: string;
    static readonly LOGOUT_SUCCESS: string;
    static readonly BROWSE_AS_GUEST_CLICKED: string;
    static readonly CONTINUE_CLICKED: string;
    static readonly TAB_CLICKED: string;
    static readonly SECTION_VIEWED: string;
    static readonly CONTENT_CLICKED: string;
    static readonly CANCEL: string;
    static readonly SEARCH_BUTTON_CLICKED: string;
    static readonly FILTER_BUTTON_CLICKED: string;
    static readonly VIEWALL_CLICKED: string;
    static readonly SHARE_COURSE_INITIATED: string;
    static readonly SHARE_LIBRARY_INITIATED: string;
    static readonly SHARE_COURSE_SUCCESS: string;
    static readonly SHARE_LIBRARY_SUCCESS: string;
    static readonly FLAG_INITIATE: string;
    static readonly FLAG_SUCCESS: string;
    static readonly FLAG_FAILED: string;
    static readonly CONTENT_PLAY: string;
    static readonly QRCodeScanClicked: string;
    static readonly QRCodeScanSuccess: string;
    static readonly QRCodeScanCancelled: string;
    static readonly NOTIFICATION_CLICKED: string;
    static readonly ANNOUNCEMENT_CLICKED: string;
    static readonly SIGNIN_OVERLAY_CLICKED: string;
    static readonly SETTINGS_CLICKED: string;
    static readonly LANGUAGE_CLICKED: string;
    static readonly DATA_SYNC_CLICKED: string;
    static readonly DEVICE_TAGS_CLICKED: string;
    static readonly SUPPORT_CLICKED: string;
    static readonly ABOUT_APP_CLICKED: string;
    static readonly SHARE_APP_CLICKED: string;
    static readonly SHARE_APP_INITIATED: string;
    static readonly SHARE_APP_SUCCESS: string;
    static readonly LANGUAGE_SETTINGS_SUCCESS: string;
    static readonly MANUALSYNC_INITIATED: string;
    static readonly MANUALSYNC_SUCCESS: string;
    static readonly RATING_CLICKED: string;
    static readonly RATING_SUBMITTED: string;
    static readonly CREATE_USER_CLICKED: string;
    static readonly CREATE_USER_INITIATED: string;
    static readonly EDIT_USER_INITIATED: string;
    static readonly CREATE_USER_SUCCESS: string;
    static readonly EDIT_USER_SUCCESS: string;
    static readonly CREATE_GROUP_CLICKED: string;
    static readonly CREATE_GROUP_INITIATED: string;
    static readonly CREATE_GROUP_SUCCESS: string;
    static readonly EDIT_GROUP_INITIATED: string;
    static readonly EDIT_GROUP_SUCCESS: string;
    static readonly SWITCH_USER_CLICKED: string;
    static readonly SWITCH_USER_INITIATE: string;
    static readonly SWITCH_USER_SUCCESS: string;
    static readonly DELETE_USER_INITIATE: string;
    static readonly DELETE_GROUP_INITIATE: string;
    static readonly SHARE_USER_GROUP_INITIATE: string;
    static readonly SHARE_USER_GROUP_SUCCESS: string;
    static readonly USER_GROUP_CLICKED: string;
    static readonly REPORTS_CLICKED: string;
    static readonly USERS_TAB_CLICKED: string;
    static readonly GROUPS_TAB_CLICKED: string;
    static readonly USER_CLICKED: string;
    static readonly GROUP_CLICKED: string;
    static readonly REPORTS_BY_USER_CLICKED: string;
    static readonly REPORTS_BY_QUESTION_CLICKED: string;
    static readonly REPORTS_SORTBY_QUESTION_CLICKED: string;
    static readonly REPORTS_SORTBY_TIME_CLICKED: string;
    static readonly REPORTS_SORTBY_RESULT_CLICKED: string;
    static readonly REPORTS_SORTBY_USER_CLICKED: string;
    static readonly REPORTS_SORTBY_SCORE_CLICKED: string;
    static readonly REPORTS_SORTBY_MARKS_CLICKED: string;
    static readonly REPORTS_SORTBY_ACCURACY_CLICKED: string;
    static readonly QUESTION_CLICKED: string;
    static readonly INITIAL_CONFIG: string;
    static readonly FILTER_CONFIG: string;
    static readonly APPLY_FILTER_CLICKED: string;
    static readonly PROFILE_ATTRIBUTE_CHANGED: string;
    static readonly SAVE_CLICKED: string;
    static readonly FINISH_CLICKED: string;
    static readonly DEVICE_BACK_CLICKED: string;
    static readonly NAV_BACK_CLICKED: string;
    static readonly SKIP_CLICKED: string;
    static readonly LANGUAGE_SELECTED: string;
    static readonly KEBAB_MENU_CLICKED: string;
    static readonly DELETE_CLICKED: string;
    static readonly DIAL_SEARCH_RESULT_FOUND: string;
    static readonly LOADING_SPINE: string;
    static readonly DOWNLOAD_ALL_CLICKED: string;
    static readonly CANCEL_CLICKED: string;
    static readonly PULL_TO_REFRESH: string;
    static readonly EDIT_CLICKED: string;
    static readonly VIEW_MORE_CLICKED: string;
    static readonly READ_MORE_CLICKED: string;
    static readonly READ_LESS_CLICKED: string;
    static readonly DOWNLOAD_PLAY_CLICKED: string;
    static readonly PLAY_CLICKED: string;
    static readonly EXTRA_INFO: string;
    static readonly PROFILE_ATTRIBUTE_POPULATION: string;
    static readonly ACCEPTANCE_CHECKBOX_CLICKED: string;
}
export declare class ErrorCode {
    static readonly ERR_DOWNLOAD_FAILED: string;
}
export declare class ErrorType {
    static readonly SYSTEM: string;
}
