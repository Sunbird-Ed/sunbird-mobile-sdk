import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {FormRequest, FormServiceConfig} from '..';
import {Observable} from 'rxjs';
import {CachedItemStore} from '../../key-value-store';
import {FileService} from '../../util/file/def/file-service';
import {Path} from '../../util/file/util/path';

export class GetFormHandler implements ApiRequestHandler<FormRequest, { [key: string]: {} }> {
    private readonly FORM_FILE_KEY_PREFIX = 'form-';
    private readonly FORM_LOCAL_KEY = 'form-';
    private readonly GET_FORM_DETAILS_ENDPOINT = '/read';

    constructor(
        private apiService: ApiService,
        private formServiceConfig: FormServiceConfig,
        private fileService: FileService,
        private cachedItemStore: CachedItemStore
    ) {
    }

    private static getIdForRequest(request: FormRequest): string {
        return request.type + '_' + request.subType + '_' + request.action;
    }

    handle(request: FormRequest): Observable<{ [key: string]: {} }> {
        return this.cachedItemStore.getCached(
            GetFormHandler.getIdForRequest(request),
            this.FORM_LOCAL_KEY,
            'ttl_' + this.FORM_LOCAL_KEY,
            () => this.fetchFormServer(request),
            () => this.fetchFromFile(request)
        );
    }

    private fetchFormServer(request: FormRequest): Observable<{ [key: string]: {} }> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.formServiceConfig.apiPath + this.GET_FORM_DETAILS_ENDPOINT)
            .withApiToken(true)
            .withBody({request})
            .build();
        return this.apiService.fetch <{ result: { [key: string]: {} } }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }

    private fetchFromFile(request: FormRequest): Observable<{ [key: string]: {} }> {
        const dir = Path.ASSETS_PATH + this.formServiceConfig.formConfigDirPath;
        const file = this.FORM_FILE_KEY_PREFIX + GetFormHandler.getIdForRequest(request) + '.json';

        return Observable.fromPromise(this.fileService.readAsText(dir, file))
            .map((filecontent: string) => {
                const result = JSON.parse(filecontent);
                return (result.result.form);
            });
    }
}
