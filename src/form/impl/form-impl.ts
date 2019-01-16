import {FormService} from '../def/form-service';
import {CachedItemStore} from '../../key-value-store';
import {ApiService} from '../../api';
import {FormServiceConfig} from '../config/form-service-config';
import {SessionAuthenticator} from '../../auth';
import {FormRequest} from '../def/form-request';
import {Observable} from 'rxjs';
import {GetFormHandler} from '../handle/get-form-handler';
import {DbService} from '../../db';
import {FileService} from '../../util/file/def/file-service';

export class FormImpl implements FormService {

    constructor(private apiService: ApiService,
                private dbService: DbService,
                private fileService: FileService,
                private cachedItemStore: CachedItemStore<{ [key: string]: {} }>,
                private formServiceConfig: FormServiceConfig,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    getForm(formRequest: FormRequest): Observable<{ [key: string]: {} }> {
        return new GetFormHandler(this.apiService, this.formServiceConfig, this.dbService,
            this.fileService, this.sessionAuthenticator, this.cachedItemStore).handle(formRequest);
    }
}
