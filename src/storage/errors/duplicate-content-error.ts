import {SunbirdError} from '../../sunbird-error';

export class DuplicateContentError extends SunbirdError {
    constructor(message: string) {
        super(message, 'DUPLICATE_CONTENT');

        Object.setPrototypeOf(this, DuplicateContentError.prototype);
    }
}
