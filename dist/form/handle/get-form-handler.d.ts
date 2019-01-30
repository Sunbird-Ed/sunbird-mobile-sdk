import { ApiRequestHandler } from '../../api';
import { FormRequest } from '../def/form-request';
import { Observable } from 'rxjs';
import { CachedItemStore } from '../../key-value-store';
import { FormServiceConfig } from '../config/form-service-config';
import { SessionAuthenticator } from '../../auth';
import { FileService } from '../../util/file/def/file-service';
import { ApiService } from '../../api/def/api-service';
export declare class GetFormHandler implements ApiRequestHandler<FormRequest, {
    [key: string]: {};
}> {
    private apiService;
    private formServiceConfig;
    private fileService;
    private sessionAuthenticator;
    private cachedItemStore;
    private readonly GET_FORM_REQUEST_ENDPOINT;
    private readonly STORED_FORM;
    constructor(apiService: ApiService, formServiceConfig: FormServiceConfig, fileService: FileService, sessionAuthenticator: SessionAuthenticator, cachedItemStore: CachedItemStore<{
        [key: string]: {};
    }>);
    handle(request: FormRequest): Observable<{
        [key: string]: {};
    }>;
    private getIdForRequest;
    private fetchFormServer;
    private fetchFilePath;
}
