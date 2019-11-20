import {WebviewRunnerError} from './webview-runner-error';

export class InterruptError extends WebviewRunnerError {
    constructor(message: string) {
        super(message, 'INTERRUPT_ERROR');

        Object.setPrototypeOf(this, WebviewRunnerError.prototype);
    }
}
