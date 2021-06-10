import { EventsBusEvent } from './events-bus-event';
import { AuthTokenRefreshError } from '../../auth/errors/auth-token-refresh-error';
import { HttpClientError, HttpServerError } from '../../api';
export interface ErrorEvent extends EventsBusEvent {
    type: ErrorEventType;
}
export interface HttpServerErrorEvent extends ErrorEvent {
    type: ErrorEventType.HTTP_SERVER_ERROR;
    payload: HttpServerError;
}
export interface HttpClientErrorEvent extends ErrorEvent {
    type: ErrorEventType.HTTP_CLIENT_ERROR;
    payload: HttpClientError;
}
export interface AuthTokenRefreshErrorEvent extends ErrorEvent {
    type: ErrorEventType.AUTH_TOKEN_REFRESH_ERROR;
    payload: AuthTokenRefreshError;
}
export declare enum ErrorEventType {
    HTTP_SERVER_ERROR = "HTTP_SERVER_ERROR",
    HTTP_CLIENT_ERROR = "HTTP_CLIENT_ERROR",
    AUTH_TOKEN_REFRESH_ERROR = "AUTH_TOKEN_REFRESH_ERROR",
    PLANNED_MAINTENANCE_PERIOD = "PLANNED_MAINTENANCE_PERIOD"
}
