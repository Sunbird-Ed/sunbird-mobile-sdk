export class Workflows {
    public static readonly APP = 'app';
    public static readonly SESSION = 'session';
    public static readonly QR = 'qr';
}

export class Environment {
    public static readonly HOME = 'home';
    public static readonly COURSE = 'course';
    public static readonly LIBRARY = 'library';
    public static readonly USER = 'user';
    public static readonly SETTINGS = 'settings';
    public static readonly ONBOARDING = 'onboarding';
}

export class ObjectType {
    public static readonly NOTIFICATION = 'notification';
    public static readonly USER = 'User';
    public static readonly GROUP = 'Group';
    public static readonly CONTENT = 'Content';
    public static readonly QUESTION = 'Question';
}

export class Mode {
    public static readonly PLAY = 'play';
}

export class PageId {
    public static readonly SPLASH_SCREEN = 'splash';
    public static readonly LOGIN = 'login';
    public static readonly LOGOUT = 'logout';
    public static readonly SIGNUP = 'signup';
    public static readonly ONBOARDING = 'onboarding';
    public static readonly USER_TYPE_SELECTION = 'user-type-selection';
    public static readonly HOME = 'home';
    public static readonly COURSES = 'courses';
    public static readonly LIBRARY = 'library';
    public static readonly GROUPS = 'groups';
    public static readonly PROFILE = 'profile';
    public static readonly COURSE_PAGE_FILTER = 'course-page-filter';
    public static readonly LIBRARY_PAGE_FILTER = 'library-page-filter';
    public static readonly COURSE_DETAIL = 'course-detail';
    public static readonly COLLECTION_DETAIL = 'collection-detail';
    public static readonly CONTENT_DETAIL = 'content-detail';
    public static readonly SHARE_CONTENT = 'share-content';
    public static readonly FLAG_CONTENT = 'flag-content';
    public static readonly CONTENT_RATING = 'content-rating';
    public static readonly ANNOUNCEMENT_LIST = 'announcement-list';
    public static readonly ANNOUNCEMENT_DETAIL = 'announcement-detail';
    public static readonly SHARE_ANNOUCEMENT = 'share-announcement';
    public static readonly QRCodeScanner = 'qr-code-scanner';
    public static readonly SERVER_NOTIFICATION = 'server-notifiaction';
    public static readonly LOCAL_NOTIFICATION = 'local-notifiaction';
    public static readonly NOTIFICATION_LIST = 'notifiaction-list';
    public static readonly SIGNIN_OVERLAY = 'signin-overlay';
    public static readonly SETTINGS = 'settings';
    public static readonly SETTINGS_LANGUAGE = 'settings-language';
    public static readonly SETTINGS_DATASYNC = 'settings-datasync';
    public static readonly SETTINGS_DEVICE_TAGS = 'settings-device-tags';
    public static readonly SETTINGS_SUPPORTS = 'settings-supports';
    public static readonly SETTINGS_ABOUT_US = 'settings-about-us';
    public static readonly ABOUT_APP = 'about-app';
    public static readonly USERS_GROUPS = 'users-groups';
    public static readonly CREATE_USER = 'create-profile';
    public static readonly CREATE_GROUP = 'create-group';
    public static readonly CREATE_GROUP_SYLLABUS_CLASS = 'create-group-syllabusclass';
    public static readonly CREATE_GROUP_USER_SELECTION = 'create-group-userselection';
    public static readonly GROUP_DETAIL = 'group-detail';
    public static readonly GUEST_PROFILE = 'guest-profile';
    public static readonly EDIT_USER = 'edit-user';
    public static readonly EDIT_GROUP = 'edit-group';
    public static readonly ADD_GROUP_SYLLABUS_CLASS = 'add-group-syllabusclass';
    public static readonly ADD_GROUP_USER_SELECTION = 'add-group-userselection';
    public static readonly REMOVE_USERS_FROM_GROUP = 'remove-users-from-group';
    public static readonly SHARE_USER_GROUP = 'share-user-group';
    public static readonly REPORTS_USER_GROUP = 'reports-users-group';
    public static readonly REPORTS_ASSESMENT_CONTENT_LIST = 'assesment-content-list';
    public static readonly REPORTS_USER_ASSESMENT_DETAILS = 'user-assesment-details';
    public static readonly REPORTS_GROUP_ASSESMENT_DETAILS = 'group-assesment-details';
    public static readonly ONBOARDING_LANGUAGE_SETTING = 'onboarding-language-setting';
    public static readonly VIEW_MORE = 'view-more';
    public static readonly DIAL_CODE_SCAN_RESULT = 'dial-code-scan-result';
    public static readonly ONBOARDING_PROFILE_PREFERENCES = 'profile-settings';
    public static readonly ONBOARDING_QR_SHOWCASE = 'onboarding-qr-showcase';
    public static readonly SEARCH = 'search';
    public static readonly DOWNLOAD_SPINE = 'download-spine';
    public static readonly DIAL_NOT_LINKED = 'dial-not-linked';
    public static readonly DIAL_LINKED_NO_CONTENT = 'dial-linked-but-no-content';
    public static readonly TERMS_N_CONDITIONS = 'terms-n-conditions';
    public static readonly TERMS_N_CONDITIONS_STATIC_PAGE = 'terms-n-conditions-static-page';

}

export class LogType {
    public static readonly NOTIFICATION = 'notification';
}

export class LogLevel {
    public static readonly TRACE = 'TRACE';
    public static readonly DEBUG = 'DEBUG';
    public static readonly INFO = 'INFO';
    public static readonly WARN = 'WARN';
    public static readonly ERROR = 'ERROR';
    public static readonly FATAL = 'FATAL';
}

export class LogMessage {
    public static readonly RECEIVED = 'Received';
    public static readonly DISPLAYED = 'Displayed';
}

export class ImpressionType {
    public static readonly SEARCH = 'search';
    public static readonly LIST = 'list';
    public static readonly DETAIL = 'detail';
    public static readonly VIEW = 'view';
    public static readonly EDIT = 'edit';
    public static readonly WORKFLOW = 'workflow';
}

export class ImpressionSubtype {
    public static readonly QRCodeScanInitiate = 'qr-code-scan-initiate';
    public static readonly RATING_POPUP = 'rating-popup';
}

export class InteractType {
    public static readonly TOUCH = 'TOUCH';
    public static readonly OTHER = 'OTHER';
}

export class InteractSubtype {
    public static readonly LOGIN_INITIATE = 'login-initiate';
    public static readonly LOGIN_SUCCESS = 'login-success';
    public static readonly SIGNUP_INITIATE = 'signup-initiate';
    public static readonly LOGOUT_INITIATE = 'logout-initiate';
    public static readonly LOGOUT_SUCCESS = 'logout-success';
    public static readonly BROWSE_AS_GUEST_CLICKED = 'browse-as-guest-clicked';
    public static readonly CONTINUE_CLICKED = 'continue-clicked';
    public static readonly TAB_CLICKED = 'tab-clicked';
    public static readonly SECTION_VIEWED = 'section-viewed';
    public static readonly CONTENT_CLICKED = 'content-clicked';
    public static readonly CANCEL = 'cancel';
    public static readonly SEARCH_BUTTON_CLICKED = 'search-button-clicked';
    public static readonly FILTER_BUTTON_CLICKED = 'filter-button-clicked';
    public static readonly VIEWALL_CLICKED = 'view-all-clicked';
    public static readonly SHARE_COURSE_INITIATED = 'share-course-initiated';
    public static readonly SHARE_LIBRARY_INITIATED = 'share-library-initiated';
    public static readonly SHARE_COURSE_SUCCESS = 'share-course-success';
    public static readonly SHARE_LIBRARY_SUCCESS = 'share-library-success';
    public static readonly FLAG_INITIATE = 'flag-initiated';
    public static readonly FLAG_SUCCESS = 'flag-success';
    public static readonly FLAG_FAILED = 'flag-failed';
    public static readonly CONTENT_PLAY = 'content-play';
    public static readonly QRCodeScanClicked = 'qr-code-scanner-clicked';
    public static readonly QRCodeScanSuccess = 'qr-code-scan-success';
    public static readonly QRCodeScanCancelled = 'qr-code-scan-cancelled';
    public static readonly NOTIFICATION_CLICKED = 'notification-clicked';
    public static readonly ANNOUNCEMENT_CLICKED = 'announcement-clicked';
    public static readonly SIGNIN_OVERLAY_CLICKED = 'signin-overlay-clicked';
    public static readonly SETTINGS_CLICKED = 'settings-clicked';
    public static readonly LANGUAGE_CLICKED = 'language-clicked';
    public static readonly DATA_SYNC_CLICKED = 'data-sync-clicked';
    public static readonly DEVICE_TAGS_CLICKED = 'device-tags-clicked';
    public static readonly SUPPORT_CLICKED = 'support-clicked';
    public static readonly ABOUT_APP_CLICKED = 'about-app-clicked';
    public static readonly SHARE_APP_CLICKED = 'share-app-clicked';
    public static readonly SHARE_APP_INITIATED = 'share-app-initiated';
    public static readonly SHARE_APP_SUCCESS = 'share-app-success';
    public static readonly LANGUAGE_SETTINGS_SUCCESS = 'language-settings-success';
    public static readonly MANUALSYNC_INITIATED = 'manualsync-initiated';
    public static readonly MANUALSYNC_SUCCESS = 'manualsync-success';
    public static readonly RATING_CLICKED = 'rating-clicked';
    public static readonly RATING_SUBMITTED = 'rating-submitted';
    public static readonly CREATE_USER_CLICKED = 'create-user-clicked';
    public static readonly CREATE_USER_INITIATED = 'create-user-initated';
    public static readonly EDIT_USER_INITIATED = 'edit-user-initated';
    public static readonly CREATE_USER_SUCCESS = 'create-user-success';
    public static readonly EDIT_USER_SUCCESS = 'edit-user-success';
    public static readonly CREATE_GROUP_CLICKED = 'create-group-clicked';
    public static readonly CREATE_GROUP_INITIATED = 'create-group-initated';
    public static readonly CREATE_GROUP_SUCCESS = 'create-group-success';
    public static readonly EDIT_GROUP_INITIATED = 'edit-group-initated';
    public static readonly EDIT_GROUP_SUCCESS = 'edit-group-success';
    public static readonly SWITCH_USER_CLICKED = 'switch-user-clicked';
    public static readonly SWITCH_USER_INITIATE = 'switch-user-initiate';
    public static readonly SWITCH_USER_SUCCESS = 'switch-user-success';
    public static readonly DELETE_USER_INITIATE = 'delete-user-initiate';
    public static readonly DELETE_GROUP_INITIATE = 'delete-group-initiate';
    public static readonly SHARE_USER_GROUP_INITIATE = 'share-usergroup-initiate';
    public static readonly SHARE_USER_GROUP_SUCCESS = 'share-usergroup-success';
    public static readonly USER_GROUP_CLICKED = 'users-groups-clicked';
    public static readonly REPORTS_CLICKED = 'reports-clicked';
    public static readonly USERS_TAB_CLICKED = 'users-tab-clicked';
    public static readonly GROUPS_TAB_CLICKED = 'groups-tab-clicked';
    public static readonly USER_CLICKED = 'user-clicked';
    public static readonly GROUP_CLICKED = 'group-clicked';
    public static readonly REPORTS_BY_USER_CLICKED = 'byuser-tab-clicked';
    public static readonly REPORTS_BY_QUESTION_CLICKED = 'byquestion-tab-clicked';
    public static readonly REPORTS_SORTBY_QUESTION_CLICKED = 'sortby-question-clicked';
    public static readonly REPORTS_SORTBY_TIME_CLICKED = 'sortby-time-clicked';
    public static readonly REPORTS_SORTBY_RESULT_CLICKED = 'sortby-result-clicked';
    public static readonly REPORTS_SORTBY_USER_CLICKED = 'sortby-users-clicked';
    public static readonly REPORTS_SORTBY_SCORE_CLICKED = 'sortby-score-clicked';
    public static readonly REPORTS_SORTBY_MARKS_CLICKED = 'sortby-marks-clicked';
    public static readonly REPORTS_SORTBY_ACCURACY_CLICKED = 'sortby-accuracy-clicked';
    public static readonly QUESTION_CLICKED = 'question-clicked';
    public static readonly INITIAL_CONFIG = 'initial-config';
    public static readonly FILTER_CONFIG = 'filter-config';
    public static readonly APPLY_FILTER_CLICKED = 'apply-filter-clicked';
    public static readonly PROFILE_ATTRIBUTE_CHANGED = 'profile_attribute_changed';
    public static readonly SAVE_CLICKED = 'save-clicked';
    public static readonly FINISH_CLICKED = 'finish-clicked';
    public static readonly DEVICE_BACK_CLICKED = 'device-back-clicked';
    public static readonly NAV_BACK_CLICKED = 'nav-back-clicked';
    public static readonly SKIP_CLICKED = 'skip-clicked';
    public static readonly LANGUAGE_SELECTED = 'language-selected';
    public static readonly KEBAB_MENU_CLICKED = 'kebab-menu-clicked';
    public static readonly DELETE_CLICKED = 'delete-clicked';
    public static readonly DIAL_SEARCH_RESULT_FOUND = 'dial-code-search-result-found';
    public static readonly LOADING_SPINE = 'loading-spine';
    public static readonly DOWNLOAD_ALL_CLICKED = 'download-all-clicked';
    public static readonly CANCEL_CLICKED = 'cancel-clicked';
    public static readonly PULL_TO_REFRESH = 'pull-to-refresh';
    public static readonly EDIT_CLICKED = 'edit-clicked';
    public static readonly VIEW_MORE_CLICKED = 'view-more-clicked';
    public static readonly READ_MORE_CLICKED = 'read-more-clicked';
    public static readonly READ_LESS_CLICKED = 'read-less-clicked';
    public static readonly DOWNLOAD_PLAY_CLICKED = 'download-play-clicked';
    public static readonly PLAY_CLICKED = 'play-clicked';
    public static readonly EXTRA_INFO = 'extra-info';
    public static readonly PROFILE_ATTRIBUTE_POPULATION = 'profile-attribute-population';
    public static readonly ACCEPTANCE_CHECKBOX_CLICKED = 'acceptance_checkbox_clicked';
}

export class ErrorCode {
    public static readonly ERR_DOWNLOAD_FAILED = 'ERR_DOWNLOAD_FAILED';
}

export class ErrorType {
    public static readonly SYSTEM = 'SYSTEM';
}