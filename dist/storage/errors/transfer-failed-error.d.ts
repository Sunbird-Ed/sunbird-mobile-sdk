import { SunbirdError } from '../../sunbird-error';
export declare class TransferFailedError extends SunbirdError {
    readonly directory: string;
    constructor(message: string, directory: string);
}
