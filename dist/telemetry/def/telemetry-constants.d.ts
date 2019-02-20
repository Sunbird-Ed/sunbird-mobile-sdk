export declare class Workflows {
    APP: string;
    SESSION: string;
    QR: string;
}
export declare enum Environment {
    HOME = "home",
    COURSE = "course",
    LIBRARY = "library",
    USER = "user",
    SETTINGS = "settings",
    ONBOARDING = "onboarding"
}
export declare class ObjectType {
    NOTIFICATION: string;
    USER: string;
    GROUP: string;
    CONTENT: string;
    QUESTION: string;
}
export declare enum Mode {
    PLAY = "play"
}
export declare class PageId {
    SPLASH_SCREEN: string;
    LOGIN: string;
    LOGOUT: string;
    SIGNUP: string;
    ONBOARDING: string;
    USER_TYPE_SELECTION: string;
    HOME: string;
    COURSES: string;
    LIBRARY: string;
    GROUPS: string;
    PROFILE: string;
    COURSE_PAGE_FILTER: string;
    LIBRARY_PAGE_FILTER: string;
    COURSE_DETAIL: string;
    COLLECTION_DETAIL: string;
    CONTENT_DETAIL: string;
    SHARE_CONTENT: string;
    FLAG_CONTENT: string;
    CONTENT_RATING: string;
    ANNOUNCEMENT_LIST: string;
    ANNOUNCEMENT_DETAIL: string;
    SHARE_ANNOUCEMENT: string;
    QRCodeScanner: string;
    SERVER_NOTIFICATION: string;
    LOCAL_NOTIFICATION: string;
    NOTIFICATION_LIST: string;
    SIGNIN_OVERLAY: string;
    SETTINGS: string;
    SETTINGS_LANGUAGE: string;
    SETTINGS_DATASYNC: string;
    SETTINGS_DEVICE_TAGS: string;
    SETTINGS_SUPPORTS: string;
    SETTINGS_ABOUT_US: string;
    ABOUT_APP: string;
    USERS_GROUPS: string;
    CREATE_USER: string;
    CREATE_GROUP: string;
    CREATE_GROUP_SYLLABUS_CLASS: string;
    CREATE_GROUP_USER_SELECTION: string;
    GROUP_DETAIL: string;
    GUEST_PROFILE: string;
    EDIT_USER: string;
    EDIT_GROUP: string;
    ADD_GROUP_SYLLABUS_CLASS: string;
    ADD_GROUP_USER_SELECTION: string;
    REMOVE_USERS_FROM_GROUP: string;
    SHARE_USER_GROUP: string;
    REPORTS_USER_GROUP: string;
    REPORTS_ASSESMENT_CONTENT_LIST: string;
    REPORTS_USER_ASSESMENT_DETAILS: string;
    REPORTS_GROUP_ASSESMENT_DETAILS: string;
    ONBOARDING_LANGUAGE_SETTING: string;
    VIEW_MORE: string;
    DIAL_CODE_SCAN_RESULT: string;
    ONBOARDING_PROFILE_PREFERENCES: string;
    ONBOARDING_QR_SHOWCASE: string;
    SEARCH: string;
    DOWNLOAD_SPINE: string;
    DIAL_NOT_LINKED: string;
    DIAL_LINKED_NO_CONTENT: string;
    TERMS_N_CONDITIONS: string;
    TERMS_N_CONDITIONS_STATIC_PAGE: string;
}
export declare enum LogType {
    NOTIFICATION = "notification"
}
export declare enum LogLevel {
    TRACE = "TRACE",
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    FATAL = "FATAL"
}
export declare class LogMessage {
    RECEIVED: string;
    DISPLAYED: string;
}
export declare enum ImpressionType {
    SEARCH = "search",
    LIST = "list",
    DETAIL = "detail",
    VIEW = "view",
    EDIT = "edit",
    WORKFLOW = "workflow"
}
export declare enum ImpressionSubtype {
    QRCodeScanInitiate = "qr-code-scan-initiate",
    RATING_POPUP = "rating-popup"
}
export declare enum InteractType {
    TOUCH = "TOUCH",
    OTHER = "OTHER"
}
export declare enum InteractSubtype {
    LOGIN_INITIATE = "login-initiate",
    LOGIN_SUCCESS = "login-success",
    SIGNUP_INITIATE = "signup-initiate",
    LOGOUT_INITIATE = "logout-initiate",
    LOGOUT_SUCCESS = "logout-success",
    BROWSE_AS_GUEST_CLICKED = "browse-as-guest-clicked",
    CONTINUE_CLICKED = "continue-clicked",
    TAB_CLICKED = "tab-clicked",
    SECTION_VIEWED = "section-viewed",
    CONTENT_CLICKED = "content-clicked",
    CANCEL = "cancel",
    SEARCH_BUTTON_CLICKED = "search-button-clicked",
    FILTER_BUTTON_CLICKED = "filter-button-clicked",
    VIEWALL_CLICKED = "view-all-clicked",
    SHARE_COURSE_INITIATED = "share-course-initiated",
    SHARE_LIBRARY_INITIATED = "share-library-initiated",
    SHARE_COURSE_SUCCESS = "share-course-success",
    SHARE_LIBRARY_SUCCESS = "share-library-success",
    FLAG_INITIATE = "flag-initiated",
    FLAG_SUCCESS = "flag-success",
    FLAG_FAILED = "flag-failed",
    CONTENT_PLAY = "content-play",
    QRCodeScanClicked = "qr-code-scanner-clicked",
    QRCodeScanSuccess = "qr-code-scan-success",
    QRCodeScanCancelled = "qr-code-scan-cancelled",
    NOTIFICATION_CLICKED = "notification-clicked",
    ANNOUNCEMENT_CLICKED = "announcement-clicked",
    SIGNIN_OVERLAY_CLICKED = "signin-overlay-clicked",
    SETTINGS_CLICKED = "settings-clicked",
    LANGUAGE_CLICKED = "language-clicked",
    DATA_SYNC_CLICKED = "data-sync-clicked",
    DEVICE_TAGS_CLICKED = "device-tags-clicked",
    SUPPORT_CLICKED = "support-clicked",
    ABOUT_APP_CLICKED = "about-app-clicked",
    SHARE_APP_CLICKED = "share-app-clicked",
    SHARE_APP_INITIATED = "share-app-initiated",
    SHARE_APP_SUCCESS = "share-app-success",
    LANGUAGE_SETTINGS_SUCCESS = "language-settings-success",
    MANUALSYNC_INITIATED = "manualsync-initiated",
    MANUALSYNC_SUCCESS = "manualsync-success",
    RATING_CLICKED = "rating-clicked",
    RATING_SUBMITTED = "rating-submitted",
    CREATE_USER_CLICKED = "create-user-clicked",
    CREATE_USER_INITIATED = "create-user-initated",
    EDIT_USER_INITIATED = "edit-user-initated",
    CREATE_USER_SUCCESS = "create-user-success",
    EDIT_USER_SUCCESS = "edit-user-success",
    CREATE_GROUP_CLICKED = "create-group-clicked",
    CREATE_GROUP_INITIATED = "create-group-initated",
    CREATE_GROUP_SUCCESS = "create-group-success",
    EDIT_GROUP_INITIATED = "edit-group-initated",
    EDIT_GROUP_SUCCESS = "edit-group-success",
    SWITCH_USER_CLICKED = "switch-user-clicked",
    SWITCH_USER_INITIATE = "switch-user-initiate",
    SWITCH_USER_SUCCESS = "switch-user-success",
    DELETE_USER_INITIATE = "delete-user-initiate",
    DELETE_GROUP_INITIATE = "delete-group-initiate",
    SHARE_USER_GROUP_INITIATE = "share-usergroup-initiate",
    SHARE_USER_GROUP_SUCCESS = "share-usergroup-success",
    USER_GROUP_CLICKED = "users-groups-clicked",
    REPORTS_CLICKED = "reports-clicked",
    USERS_TAB_CLICKED = "users-tab-clicked",
    GROUPS_TAB_CLICKED = "groups-tab-clicked",
    USER_CLICKED = "user-clicked",
    GROUP_CLICKED = "group-clicked",
    REPORTS_BY_USER_CLICKED = "byuser-tab-clicked",
    REPORTS_BY_QUESTION_CLICKED = "byquestion-tab-clicked",
    REPORTS_SORTBY_QUESTION_CLICKED = "sortby-question-clicked",
    REPORTS_SORTBY_TIME_CLICKED = "sortby-time-clicked",
    REPORTS_SORTBY_RESULT_CLICKED = "sortby-result-clicked",
    REPORTS_SORTBY_USER_CLICKED = "sortby-users-clicked",
    REPORTS_SORTBY_SCORE_CLICKED = "sortby-score-clicked",
    REPORTS_SORTBY_MARKS_CLICKED = "sortby-marks-clicked",
    REPORTS_SORTBY_ACCURACY_CLICKED = "sortby-accuracy-clicked",
    QUESTION_CLICKED = "question-clicked",
    INITIAL_CONFIG = "initial-config",
    FILTER_CONFIG = "filter-config",
    APPLY_FILTER_CLICKED = "apply-filter-clicked",
    PROFILE_ATTRIBUTE_CHANGED = "profile_attribute_changed",
    SAVE_CLICKED = "save-clicked",
    FINISH_CLICKED = "finish-clicked",
    DEVICE_BACK_CLICKED = "device-back-clicked",
    NAV_BACK_CLICKED = "nav-back-clicked",
    SKIP_CLICKED = "skip-clicked",
    LANGUAGE_SELECTED = "language-selected",
    KEBAB_MENU_CLICKED = "kebab-menu-clicked",
    DELETE_CLICKED = "delete-clicked",
    DIAL_SEARCH_RESULT_FOUND = "dial-code-search-result-found",
    LOADING_SPINE = "loading-spine",
    DOWNLOAD_ALL_CLICKED = "download-all-clicked",
    CANCEL_CLICKED = "cancel-clicked",
    PULL_TO_REFRESH = "pull-to-refresh",
    EDIT_CLICKED = "edit-clicked",
    VIEW_MORE_CLICKED = "view-more-clicked",
    READ_MORE_CLICKED = "read-more-clicked",
    READ_LESS_CLICKED = "read-less-clicked",
    DOWNLOAD_PLAY_CLICKED = "download-play-clicked",
    PLAY_CLICKED = "play-clicked",
    EXTRA_INFO = "extra-info",
    PROFILE_ATTRIBUTE_POPULATION = "profile-attribute-population",
    ACCEPTANCE_CHECKBOX_CLICKED = "acceptance_checkbox_clicked"
}
export declare enum ErrorCode {
    ERR_DOWNLOAD_FAILED = "ERR_DOWNLOAD_FAILED"
}
export declare class ErrorType {
    SYSTEM: string;
}
