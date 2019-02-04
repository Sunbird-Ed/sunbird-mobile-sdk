import {ApiRequestHandler, HttpRequestType, Request} from '../../api';
import {FormRequest} from '../def/form-request';
import {Observable} from 'rxjs';
import {CachedItemStore} from '../../key-value-store';
import {FormServiceConfig} from '../config/form-service-config';
import {SessionAuthenticator} from '../../auth';
import {FileService} from '../../util/file/def/file-service';
import {Path} from '../../util/file/util/path';
import {ApiService} from '../../api/def/api-service';

export class GetFormHandler implements ApiRequestHandler<FormRequest, { [key: string]: {} }> {
    private readonly GET_FORM_REQUEST_ENDPOINT = 'form/read';
    private readonly STORED_FORM = 'form-';

    constructor(
        private apiService: ApiService,
        private formServiceConfig: FormServiceConfig,
        private fileService: FileService,
        private sessionAuthenticator: SessionAuthenticator,
        private cachedItemStore: CachedItemStore<{ [key: string]: {} }>
    ) {
    }

    handle(request: FormRequest): Observable<{ [key: string]: {} }> {
        return this.cachedItemStore.getCached(
            this.getIdForRequest(request),
            this.STORED_FORM,
            this.STORED_FORM,
            () => this.fetchFormServer(request),
            () => this.fetchFilePath()
        );
    }

    private getIdForRequest(request: FormRequest): string {
        let key = '';
        key += request.type + request.subType + request.rootOrgId;
        if (!request.frameWork) {
            key += false;
        }
        return key;
    }

    private fetchFormServer(request: FormRequest): Observable<{ [key: string]: {} }> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.formServiceConfig.apiPath + this.GET_FORM_REQUEST_ENDPOINT + this.getIdForRequest(request))
            .withApiToken(true)
            .withBody(request)
            .withInterceptors([this.sessionAuthenticator])
            .build();
        return this.apiService.fetch <{ result: { [key: string]: {} } }>(apiRequest).map((success) => {
            return success.body.result;
        });
    }

    private fetchFilePath(): Observable<{ [key: string]: {} }> {
        const fileDirPath = Path.dirPathFromFilePath(this.formServiceConfig.formFilePath);
        const filePath = Path.fileNameFromFilePath(this.formServiceConfig.formFilePath);
        return Observable.fromPromise(this.fileService.readAsText(fileDirPath, filePath)).map((fileContent: string) => {
            return Observable.of(JSON.parse(fileContent));
        });
    }
}
