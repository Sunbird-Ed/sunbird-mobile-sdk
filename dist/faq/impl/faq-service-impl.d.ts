import { GetFaqRequest } from './../def/get-faq-request';
import { CachedItemStore } from '../../key-value-store';
import { FaqService, Faq } from '..';
import { FileService } from '../../util/file/def/file-service';
import { Observable } from 'rxjs';
import { ApiService } from '../../api';
import { SdkConfig } from '../../sdk-config';
export declare class FaqServiceImpl implements FaqService {
    private sdkConfig;
    private fileService;
    private apiService;
    private cachedItemStore;
    constructor(sdkConfig: SdkConfig, fileService: FileService, apiService: ApiService, cachedItemStore: CachedItemStore);
    getFaqDetails(request: GetFaqRequest): Observable<Faq>;
}
