import {WebviewRunnerError} from './webview-runner-error';

export class ParamNotCapturedError extends WebviewRunnerError {
    constructor(message: string) {
        super(message, 'PARAM_NOT_CAPTURED');

        Object.setPrototypeOf(this, ParamNotCapturedError.prototype);
    }
}
