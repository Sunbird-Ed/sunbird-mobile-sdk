import {SunbirdError} from '../../sunbird-error';

export class LowMemoryError extends SunbirdError {
    constructor(message: string) {
        super(message, 'LOW_MEMORY');

        Object.setPrototypeOf(this, LowMemoryError.prototype);
    }
}
