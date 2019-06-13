import {SunbirdError} from '../../sunbird-error';

export class TransferFailedDuplicateContentError extends SunbirdError {
    constructor(message: string) {
        super(message, 'TRANSFER_FAILED_DUPLICATE_CONTENT_ERROR');

        Object.setPrototypeOf(this, TransferFailedDuplicateContentError.prototype);
    }
}
