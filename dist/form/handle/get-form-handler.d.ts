import { ApiRequestHandler, ApiService } from '../../api';
import { FormRequest, FormServiceConfig } from '..';
import { Observable } from 'rxjs';
import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
export declare class GetFormHandler implements ApiRequestHandler<FormRequest, {
    [key: string]: {};
}> {
    private apiService;
    private formServiceConfig;
    private fileService;
    private cachedItemStore;
    private readonly FORM_FILE_KEY_PREFIX;
    private readonly FORM_LOCAL_KEY;
    private readonly GET_FORM_DETAILS_ENDPOINT;
    constructor(apiService: ApiService, formServiceConfig: FormServiceConfig, fileService: FileService, cachedItemStore: CachedItemStore);
    private static getIdForRequest;
    handle(request: FormRequest): Observable<{
        [key: string]: {};
    }>;
    private fetchFormServer;
    private fetchFromFile;
}
