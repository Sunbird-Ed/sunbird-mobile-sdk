import {SunbirdError} from '../../../../sunbird-error';

export abstract class WebviewRunnerError extends SunbirdError {
    protected constructor(message: string, code: string) {
        super(message, code);

        Object.setPrototypeOf(this, WebviewRunnerError.prototype);
    }
}
