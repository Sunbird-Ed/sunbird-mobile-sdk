import {SunbirdError} from '../../../sunbird-error';

export abstract class ImportAssertionError extends SunbirdError {
    protected constructor(message: string, code: string) {
        super(message, `ASSERTION_ERROR_${code}`);
        Object.setPrototypeOf(this, ImportAssertionError.prototype);
    }
}
