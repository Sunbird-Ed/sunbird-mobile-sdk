import {SunbirdError} from '../../sunbird-error';

export class CancellationError extends SunbirdError {
    constructor(message: string) {
        super(message, 'CANCELLED');

        Object.setPrototypeOf(this, CancellationError.prototype);
    }
}
