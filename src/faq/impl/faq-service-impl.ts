import { GetFaqRequest } from './../def/get-faq-request';
import {CachedItemStore} from '../../key-value-store';
import {FaqService, Faq} from '..';
import {GetFaqDetailsHandler} from '../handler/get-faq-details-handler';
import {FileService} from '../../util/file/def/file-service';
import {Observable} from 'rxjs';
import {ApiService} from '../../api';
import {SdkConfig} from '../../sdk-config';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';

@injectable()
export class FaqServiceImpl implements FaqService {

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
                @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
                @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
                @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore) {
    }

    getFaqDetails(request: GetFaqRequest): Observable<Faq> {
        return new GetFaqDetailsHandler(
            this.apiService,
            this.sdkConfig.faqServiceConfig,
            this.fileService,
            this.cachedItemStore,
        ).handle(request);
    }

}
