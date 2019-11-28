import {EventsBusEvent} from '../../events-bus';

export interface AuthEvent extends EventsBusEvent {
    type: AuthEventType;
}

export enum AuthEventType {
    AUTO_MIGRATE_SUCCESS = 'AUTO_MIGRATE_SUCCESS',
    AUTO_MIGRATE_FAIL = 'AUTO_MIGRATE_FAIL',
}
