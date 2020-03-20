import { SunbirdError } from '../../../sunbird-error';
export declare abstract class ExportAssertionError extends SunbirdError {
    protected constructor(message: string, code: string);
}
