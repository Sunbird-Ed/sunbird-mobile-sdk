import { FormService } from '../def/form-service';
import { CachedItemStore } from '../../key-value-store';
import { FormServiceConfig } from '../config/form-service-config';
import { SessionAuthenticator } from '../../auth';
import { FormRequest } from '../def/form-request';
import { Observable } from 'rxjs';
import { FileService } from '../../util/file/def/file-service';
import { ApiService } from '../../api/def/api-service';
export declare class FormServiceImpl implements FormService {
    private formServiceConfig;
    private apiService;
    private fileService;
    private cachedItemStore;
    private sessionAuthenticator;
    constructor(formServiceConfig: FormServiceConfig, apiService: ApiService, fileService: FileService, cachedItemStore: CachedItemStore<{
        [key: string]: {};
    }>, sessionAuthenticator: SessionAuthenticator);
    getForm(formRequest: FormRequest): Observable<{
        [key: string]: {};
    }>;
}
