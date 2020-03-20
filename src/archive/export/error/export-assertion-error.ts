import {SunbirdError} from '../../../sunbird-error';

export abstract class ExportAssertionError extends SunbirdError {
    protected constructor(message: string, code: string) {
        super(message, `ASSERTION_ERROR_${code}`);
        Object.setPrototypeOf(this, ExportAssertionError.prototype);
    }
}
