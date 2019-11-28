import {WebviewRunnerError} from './webview-runner-error';

export class NoInappbrowserSessionAssertionFailError extends WebviewRunnerError {
    constructor(message: string) {
        super(message, 'NO_INAPPBROWSER_SESSION_ASSERTION_FAIL');

        Object.setPrototypeOf(this, WebviewRunnerError.prototype);
    }
}
