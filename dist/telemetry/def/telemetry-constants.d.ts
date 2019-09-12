export declare type Workflows = string;
export declare type Environment = string;
export declare enum ObjectType {
    NOTIFICATION = "notification",
    USER = "User",
    GROUP = "Group",
    CONTENT = "Content",
    QUESTION = "Question"
}
export declare enum Mode {
    PLAY = "play"
}
export declare type PageId = string;
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
export declare enum ShareDirection {
    IN = "In",
    OUT = "Out"
}
export declare enum ShareType {
    FILE = "File",
    MESSAGE = "Message",
    LINK = "Link"
}
export declare enum ShareItemType {
    CONTENT = "CONTENT",
    EXPLODEDCONTENT = "EXPLODEDCONTENT",
    TELEMETRY = "TELEMETRY",
    PROFILE = "PROFILE"
}
export declare class LogMessage {
    RECEIVED: string;
    DISPLAYED: string;
}
export declare enum InteractType {
    TOUCH = "TOUCH",
    OTHER = "OTHER"
}
export declare enum InteractSubType {
    NETWORK_SPEED = "network-speed",
    SUBTYPE_SPINE = "spine",
    ONLINE = "online",
    FULL = "full",
    CONTENT_VARIANT = "content-variant-download",
    DEVICE_TIME_OFFSET_FOUND = "device-time-offset-found",
    CONTENT_DOWNLOAD_INITIATE = "ContentDownload-Initiate",
    CONTENT_DOWNLOAD_SUCCESS = "ContentDownload-Success",
    CONTENT_DOWNLOAD_CANCEL = "ContentDownload-Cancel"
}
export declare enum TelemetryErrorCode {
    ERR_DOWNLOAD_FAILED = "ERR_DOWNLOAD_FAILED"
}
export declare enum ErrorType {
    SYSTEM = "SYSTEM"
}
