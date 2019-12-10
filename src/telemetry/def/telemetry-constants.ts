export type Workflows = string;

export type Environment = string;

export enum ObjectType {
    NOTIFICATION = 'notification',
    USER = 'User',
    GROUP = 'Group',
    CONTENT = 'Content',
    QUESTION = 'Question'
}

export enum Mode {
    PLAY = 'play'
}

export type PageId = string;

export enum LogType {
    NOTIFICATION = 'notification'
}

export enum LogLevel {
    TRACE = 'TRACE',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL'
}

export enum ShareDirection {
    IN = 'In',
    OUT = 'Out',
}

export enum ShareType {
    FILE = 'File',
    MESSAGE = 'Message',
    LINK = 'Link'
}

export enum ShareItemType {
    CONTENT = 'CONTENT',
    EXPLODEDCONTENT = 'EXPLODEDCONTENT',
    TELEMETRY = 'TELEMETRY',
    PROFILE = 'PROFILE'
}

export class LogMessage {
    RECEIVED = 'Received';
    DISPLAYED = 'Displayed';
}


export enum InteractType {
    TOUCH = 'TOUCH',
    OTHER = 'OTHER'
}

export enum InteractSubType {
    NETWORK_SPEED = 'network-speed',
    SUBTYPE_SPINE = 'spine',
    ONLINE = 'online',
    FULL = 'full',
    CONTENT_VARIANT = 'content-variant-download',
    DEVICE_TIME_OFFSET_FOUND = 'device-time-offset-found',
    CONTENT_DOWNLOAD_INITIATE = 'ContentDownload-Initiate',
    CONTENT_DOWNLOAD_SUCCESS = 'ContentDownload-Success',
    CONTENT_DOWNLOAD_CANCEL = 'ContentDownload-Cancel',
}


export enum TelemetryErrorCode {
    ERR_DOWNLOAD_FAILED = 'ERR_DOWNLOAD_FAILED'
}

export enum ErrorType {
    SYSTEM = 'SYSTEM'
}

