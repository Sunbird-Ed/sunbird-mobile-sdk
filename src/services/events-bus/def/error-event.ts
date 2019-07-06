import {EventsBusEvent} from './events-bus-event';
import {AuthTokenRefreshError} from '../../auth/errors/auth-token-refresh-error';

export interface ErrorEvent extends EventsBusEvent {
    type: ErrorEventType;
}

export interface AuthTokenRefreshErrorEvent extends ErrorEvent {
    type: ErrorEventType.AUTH_TOKEN_REFRESH_ERROR;
    payload: AuthTokenRefreshError;
}

export enum ErrorEventType {
    AUTH_TOKEN_REFRESH_ERROR = 'AUTH_TOKEN_REFRESH_ERROR'
}
