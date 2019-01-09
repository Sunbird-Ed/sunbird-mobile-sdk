import {ContentService} from '../def/content-service';
import {Observable} from 'rxjs';
import {ContentDetailRequest} from '../def/requests';
import {Content} from '../def/content';

export class ContentServiceImpl implements ContentService {
    getContentDetails(request: ContentDetailRequest): Observable<Response<Content>> {

    }
}
