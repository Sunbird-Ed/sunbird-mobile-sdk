import {ContentService} from '../def/content-service';
import {Observable} from 'rxjs';
import {ContentDetailRequest} from '../def/requests';
import {Content} from '../def/content';
import {ApiService} from '../../api';
import {ProfileService} from '../../profile';
import {KeyValueStore} from '../../key-value-store';
import {SessionAuthenticator} from '../../auth';
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';
import {DbService} from '../../db';
import {ContentServiceConfig} from '../config/content-config';

export class ContentServiceImpl implements ContentService {
    constructor(private apiService: ApiService,
                private dbService: DbService,
                private profileService: ProfileService,
                private contentServiceConfig: ContentServiceConfig,
                private keyValueStore: KeyValueStore,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    getContentDetails(request: ContentDetailRequest): Observable<Content> {
        return new GetContentDetailsHandler(
            this.dbService, this.contentServiceConfig, this.sessionAuthenticator, this.apiService).handle(request);
    }
}
