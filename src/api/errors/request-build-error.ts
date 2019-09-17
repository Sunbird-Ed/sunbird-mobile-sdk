import {SunbirdError} from '../../sunbird-error';

export class RequestBuildError extends SunbirdError {
  constructor(message: string) {
    super(message, 'REQUEST_BUILD_ERROR');

    Object.setPrototypeOf(this, RequestBuildError.prototype);
  }
}
