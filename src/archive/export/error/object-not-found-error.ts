import {ExportAssertionError} from './export-assertion-error';

export class ObjectNotFoundError extends ExportAssertionError {
    constructor(message: string) {
        super(message, 'OBJECT_NOT_FOUND');
        Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
    }
}
