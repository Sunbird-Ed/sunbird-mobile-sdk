import {SunbirdError} from '../../sunbird-error';

export class CertificateAlreadyDownloaded extends SunbirdError {
  readonly filePath: string;
  constructor(message: string, filePath: string) {
    super(message, 'CERTIFICATE_ALREADY_DOWNLOADED');
    this.filePath = filePath;

    Object.setPrototypeOf(this, CertificateAlreadyDownloaded.prototype);
  }
}
