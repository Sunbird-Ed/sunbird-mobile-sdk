import {ImportAssertionError} from './import-assertion-error';

export class InvalidArchiveError extends ImportAssertionError {
    constructor(message: string) {
        super(message, 'INVALID_ARCHIVE');
        Object.setPrototypeOf(this, InvalidArchiveError.prototype);
    }
}
