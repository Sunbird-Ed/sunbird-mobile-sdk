import {ImportAssertionError} from './import-assertion-error';

export class UnknownObjectError extends ImportAssertionError {
    constructor(message: string) {
        super(message, 'UNKNOWN_OBJECT_ERROR');
        Object.setPrototypeOf(this, UnknownObjectError.prototype);
    }
}
