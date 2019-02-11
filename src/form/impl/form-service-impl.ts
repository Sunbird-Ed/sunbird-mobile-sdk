import {FormRequest, FormService, FormServiceConfig} from '..';
import {CachedItemStore} from '../../key-value-store';
import {Observable} from 'rxjs';
import {GetFormHandler} from '../handle/get-form-handler';
import {FileService} from '../../util/file/def/file-service';
import {ApiService} from '../../api';

export class FormServiceImpl implements FormService {

    constructor(private formServiceConfig: FormServiceConfig,
                private apiService: ApiService,
                private fileService: FileService,
                private cachedItemStore: CachedItemStore<{ [key: string]: {} }>) {
    }

    getForm(formRequest: FormRequest): Observable<{ [key: string]: {} }> {
        return new GetFormHandler(this.apiService, this.formServiceConfig,
            this.fileService, this.cachedItemStore).handle(formRequest);
    }
}
