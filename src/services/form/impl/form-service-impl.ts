import {FormRequest, FormService} from '../index';
import {CachedItemStore} from '../../key-value-store';
import {Observable} from 'rxjs';
import {GetFormHandler} from '../handle/get-form-handler';
import {FileService} from '../../../native/file/def/file-service';
import {HttpService} from '../../../native/http';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {SdkConfig} from '../../../bootstrap/sdk-config';

@injectable()
export class FormServiceImpl implements FormService {
    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: HttpService,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore) {
    }

    getForm(formRequest: FormRequest): Observable<{ [key: string]: {} }> {
        return new GetFormHandler(this.apiService, this.sdkConfig,
            this.fileService, this.cachedItemStore).handle(formRequest);
    }
}
