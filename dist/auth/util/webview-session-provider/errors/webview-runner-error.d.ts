import { SunbirdError } from '../../../../sunbird-error';
export declare abstract class WebviewRunnerError extends SunbirdError {
    protected constructor(message: string, code: string);
}
