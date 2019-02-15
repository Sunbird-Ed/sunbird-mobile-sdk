import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {
    GetSystemSettingsRequest,
    SystemSettingsService,
    SystemSettingsConfig,
    SystemSettings
} from '..';
import {FileService} from '../../util/file/def/file-service';
import {Observable} from 'rxjs';
import {ApiService} from '../../api';
import { GetSystemSettingsHandler } from '../handlers/get-system-settings-handler';


export class SystemSettingsServiceImpl implements SystemSettingsService {

    constructor(
        private systemSettingsConfig: SystemSettingsConfig,
        private apiService: ApiService,
        private fileService: FileService,
        private cachedChannelItemStore: CachedItemStore<SystemSettings>,
    ) {}

    getSystemSettings(request: GetSystemSettingsRequest): Observable<SystemSettings> {
        return new GetSystemSettingsHandler(
            this.apiService,
            this.systemSettingsConfig,
            this.fileService,
            this.cachedChannelItemStore,
        ).handle(request);
    }
}
