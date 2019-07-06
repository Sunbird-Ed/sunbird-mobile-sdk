import {SunbirdError} from '../../../sunbird-error';

export class NetworkError extends SunbirdError {
    constructor(message: string) {
        super(message, 'NETWORK_ERROR');

        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
