import {SunbirdError} from '../../sunbird-error';

export class InAppBrowserExitError extends SunbirdError {
    constructor(message: string) {
        super(message, 'IN_APP_BROWSER_EXIT_ERROR');

        Object.setPrototypeOf(this, InAppBrowserExitError.prototype);
    }
}
