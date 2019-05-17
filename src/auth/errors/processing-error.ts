import {SunbirdError} from '../../sunbird-error';

export class ProcessingError extends SunbirdError {
    constructor(message: string) {
        super(message, 'PROCESSING_ERROR');

        Object.setPrototypeOf(this, ProcessingError.prototype);
    }
}
