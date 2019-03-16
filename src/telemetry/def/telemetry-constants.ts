export class Workflows {
    APP = 'app';
    SESSION = 'session';
    QR = 'qr';
}

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

export type ImpressionType = string;

export type ImpressionSubtype = string;

export enum InteractType {
    TOUCH = 'TOUCH',
    OTHER = 'OTHER'
}

export type InteractSubtype = string;

export enum TelemetryErrorCode {
    ERR_DOWNLOAD_FAILED = 'ERR_DOWNLOAD_FAILED'
}

export enum ErrorType {
    SYSTEM = 'SYSTEM'
}
