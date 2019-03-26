import {SunbirdError} from '../../sunbird-error';
import {Response} from '..';

export class ServerError extends SunbirdError {
    constructor(message: string, public readonly response: Response) {
        super(message, 'SERVER_ERROR');

        Object.setPrototypeOf(this, ServerError.prototype);
    }
}
