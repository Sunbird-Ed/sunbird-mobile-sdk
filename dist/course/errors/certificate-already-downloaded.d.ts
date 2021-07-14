import { SunbirdError } from '../../sunbird-error';
export declare class CertificateAlreadyDownloaded extends SunbirdError {
    readonly filePath: string;
    constructor(message: string, filePath: string);
}
