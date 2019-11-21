import { GetFaqRequest } from './../def/get-faq-request';
import { CachedItemStore } from '../../key-value-store';
import { FileService } from '../../util/file/def/file-service';
import { ApiService } from '../../api';
import { Observable } from 'rxjs';
import { FaqServiceConfig } from '..';
export declare class GetFaqDetailsHandler {
    private apiService;
    private faqServiceConfig;
    private fileservice;
    private cachedItemStore;
    private readonly FAQ_FILE_KEY_PREFIX;
    private readonly FAQ_LOCAL_KEY;
    constructor(apiService: ApiService, faqServiceConfig: FaqServiceConfig, fileservice: FileService, cachedItemStore: CachedItemStore);
    handle(request: GetFaqRequest): Observable<any>;
    private fetchFromServer;
    private fetchFromFile;
}
