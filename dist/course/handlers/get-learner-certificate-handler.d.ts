import { ApiRequestHandler, ApiService } from '../../api';
import { GetLearnerCerificateRequest } from '..';
import { Observable } from 'rxjs';
import { LearnerCertificate } from '../def/get-learner-certificate-response';
import { CachedItemStore } from '../../key-value-store';
export declare class GetLearnerCertificateHandler implements ApiRequestHandler<GetLearnerCerificateRequest, {
    count: number;
    content: LearnerCertificate[];
}> {
    private apiService;
    private cachedItemStore;
    private static readonly CERTIFICATE_SEARCH_ENDPOINT;
    private static readonly GET_LEARNER_CERTIFICATE_LOCAL_KEY;
    constructor(apiService: ApiService, cachedItemStore: CachedItemStore);
    handle(request: GetLearnerCerificateRequest): Observable<{
        count: number;
        content: LearnerCertificate[];
    }>;
    private fetchFromServer;
}
