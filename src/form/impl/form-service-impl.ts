import {FormRequest, FormService, FormServiceConfig} from '..';
import {CachedItemStore} from '../../key-value-store';
import {Observable} from 'rxjs';
import {GetFormHandler} from '../handle/get-form-handler';
import {FileService} from '../../util/file/def/file-service';
import {ApiService} from '../../api';
import { injectable, inject } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { SdkConfig } from '../../sdk-config';

@injectable()
export class FormServiceImpl implements FormService {

    private formServiceConfig: FormServiceConfig;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore) {
        this.formServiceConfig = this.sdkConfig.formServiceConfig;
    }

    getForm(formRequest: FormRequest): Observable<{ [key: string]: {} }> {
        return new GetFormHandler(this.apiService, this.formServiceConfig,
            this.fileService, this.cachedItemStore).handle(formRequest);
    }
}
