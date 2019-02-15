import { FormRequest, FormService, FormServiceConfig } from '..';
import { CachedItemStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { FileService } from '../../util/file/def/file-service';
import { ApiService } from '../../api';
export declare class FormServiceImpl implements FormService {
    private formServiceConfig;
    private apiService;
    private fileService;
    private cachedItemStore;
    constructor(formServiceConfig: FormServiceConfig, apiService: ApiService, fileService: FileService, cachedItemStore: CachedItemStore<{
        [key: string]: {};
    }>);
    getForm(formRequest: FormRequest): Observable<{
        [key: string]: {};
    }>;
}
