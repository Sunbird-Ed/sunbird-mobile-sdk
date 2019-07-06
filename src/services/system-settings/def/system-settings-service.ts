import {Observable} from 'rxjs';
import {GetSystemSettingsRequest, SystemSettings} from '../index';

export interface SystemSettingsService {

    getSystemSettings(request: GetSystemSettingsRequest): Observable<SystemSettings>;

}
