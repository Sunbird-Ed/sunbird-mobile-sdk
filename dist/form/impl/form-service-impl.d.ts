import { FormRequest, FormService } from '..';
import { CachedItemStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { FileService } from '../../util/file/def/file-service';
import { ApiService } from '../../api';
import { SdkConfig } from '../../sdk-config';
export declare class FormServiceImpl implements FormService {
    private sdkConfig;
    private apiService;
    private fileService;
    private cachedItemStore;
    private formServiceConfig;
    constructor(sdkConfig: SdkConfig, apiService: ApiService, fileService: FileService, cachedItemStore: CachedItemStore);
    getForm(formRequest: FormRequest): Observable<{
        [key: string]: {};
    }>;
}
