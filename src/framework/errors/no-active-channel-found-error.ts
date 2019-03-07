import {SunbirdError} from '../../sunbird-error';

export class NoActiveChannelFoundError extends SunbirdError {
    constructor(message: string) {
        super(message, 'NO_ACTIVE_CHANNEL_FOUND_ERROR');

        Object.setPrototypeOf(this, NoActiveChannelFoundError.prototype);
    }
}
