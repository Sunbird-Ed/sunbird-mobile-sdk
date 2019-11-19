import {SunbirdError} from '../../sunbird-error';
import {Response} from '..';

export class HttpServerError extends SunbirdError {
    constructor(message: string, public readonly response: Response) {
        super(message, 'HTTP_SERVER_ERROR');

        Object.setPrototypeOf(this, HttpServerError.prototype);
    }
}
