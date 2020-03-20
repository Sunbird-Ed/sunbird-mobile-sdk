import { SunbirdError } from '../../../sunbird-error';
export declare abstract class ImportAssertionError extends SunbirdError {
    protected constructor(message: string, code: string);
}
