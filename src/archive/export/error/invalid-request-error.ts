import {ExportAssertionError} from './export-assertion-error';

export class InvalidRequestError extends ExportAssertionError {
    constructor(message: string) {
        super(message, 'INVALID_REQUEST');
        Object.setPrototypeOf(this, InvalidRequestError.prototype);
    }
}
