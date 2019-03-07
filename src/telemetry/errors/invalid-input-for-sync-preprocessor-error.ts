import {SunbirdError} from '../../sunbird-error';

export class InvalidInputForSyncPreprocessorError extends SunbirdError {
    constructor(message: string) {
        super(message, 'INVALID_INPUT_FOR_SYNC_PREPROCESSOR');

        Object.setPrototypeOf(this, InvalidInputForSyncPreprocessorError.prototype);
    }
}
