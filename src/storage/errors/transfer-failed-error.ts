import {SunbirdError} from '../../sunbird-error';

export class TransferFailedError extends SunbirdError {
    constructor(message: string, public readonly directory: string) {
        super(message, 'TRANSFER_FAILED_ERROR');

        Object.setPrototypeOf(this, TransferFailedError.prototype);
    }
}
