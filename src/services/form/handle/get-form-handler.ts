import {ApiRequestHandler, HttpRequestType, HttpService, Request} from '../../../native/http';
import {FormRequest} from '..';
import {Observable} from 'rxjs';
import {CachedItemStore} from '../../key-value-store';
import {FileService} from '../../../native/file/def/file-service';
import {SdkConfig} from '../../..';

export class GetFormHandler implements ApiRequestHandler<FormRequest, { [key: string]: {} }> {
    private readonly FORM_FILE_KEY_PREFIX = 'form-';
    private readonly FORM_LOCAL_KEY = 'form-';
    private readonly GET_FORM_DETAILS_ENDPOINT = '/read';

    constructor(
        private apiService: HttpService,
        private sdkConfig: SdkConfig,
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
            .withPath(this.sdkConfig.formServiceConfig.apiPath + this.GET_FORM_DETAILS_ENDPOINT)
            .withApiToken(true)
            .withBody({request})
            .build();
        return this.apiService.fetch <{ result: { [key: string]: {} } }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }

    private fetchFromFile(request: FormRequest): Observable<{ [key: string]: {} }> {
        const dir = this.sdkConfig.bootstrapConfig.assetsDir + this.sdkConfig.formServiceConfig.formConfigDirPath;
        const file = this.FORM_FILE_KEY_PREFIX + GetFormHandler.getIdForRequest(request) + '.json';

        return Observable.fromPromise(this.fileService.readAsText(dir, file))
            .map((filecontent: string) => {
                const result = JSON.parse(filecontent);
                return (result.result.form);
            });
    }
}
