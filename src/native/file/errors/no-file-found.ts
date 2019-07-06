import {SunbirdError} from '../../../sunbird-error';

export class NoFileFoundError extends SunbirdError {
    constructor(message: string) {
        super(message, 'NO_FILE_FOUND');

        Object.setPrototypeOf(this, NoFileFoundError.prototype);
    }
}
