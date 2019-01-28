import {FormService} from '../def/form-service';
import {CachedItemStore} from '../../key-value-store';
import {FormServiceConfig} from '../config/form-service-config';
import {SessionAuthenticator} from '../../auth';
import {FormRequest} from '../def/form-request';
import {Observable} from 'rxjs';
import {GetFormHandler} from '../handle/get-form-handler';
import {FileService} from '../../util/file/def/file-service';
import {ApiService} from '../../api/def/api-service';

export class FormServiceImpl implements FormService {

    constructor(private formServiceConfig: FormServiceConfig,
                private apiService: ApiService,
                private fileService: FileService,
                private cachedItemStore: CachedItemStore<{ [key: string]: {} }>,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    getForm(formRequest: FormRequest): Observable<{ [key: string]: {} }> {
        return new GetFormHandler(this.apiService, this.formServiceConfig,
            this.fileService, this.sessionAuthenticator, this.cachedItemStore).handle(formRequest);
    }
}
