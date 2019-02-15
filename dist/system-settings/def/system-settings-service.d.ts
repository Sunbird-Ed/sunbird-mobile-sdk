import { Observable } from 'rxjs';
import { GetSystemSettingsRequest, SystemSettings } from '..';
export interface SystemSettingsService {
    getSystemSettings(request: GetSystemSettingsRequest): Observable<SystemSettings>;
}
