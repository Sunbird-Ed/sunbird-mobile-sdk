import {SunbirdError} from '../../sunbird-error';

export class NoCertificateFound extends SunbirdError {
  constructor(message: string) {
    super(message, 'NO_CERTIFICATE_FOUND');

    Object.setPrototypeOf(this, NoCertificateFound.prototype);
  }
}
