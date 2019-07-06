import {SunbirdError} from '../../../sunbird-error';
import {Response} from '../index';

export class ServerError extends SunbirdError {
    constructor(message: string, public readonly response: Response) {
        super(message, 'SERVER_ERROR');

        Object.setPrototypeOf(this, ServerError.prototype);
    }
}
