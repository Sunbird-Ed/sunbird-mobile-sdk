import {SunbirdError} from '../../sunbird-error';

export class CertificateAlreadyDownloaded extends SunbirdError {
  constructor(message: string) {
    super(message, 'CERTIFICATE_ALREADY_DOWNLOADED');

    Object.setPrototypeOf(this, CertificateAlreadyDownloaded.prototype);
  }
}
