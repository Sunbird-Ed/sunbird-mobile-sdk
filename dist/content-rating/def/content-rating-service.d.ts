import { ContentRatingOptions } from './content-rating';
import { GetContentRatingOptionsRequest } from './get-content-rating-request';
import { Observable } from 'rxjs';
export interface ContentRatingService {
    getContentRatingOptions(request: GetContentRatingOptionsRequest): Observable<ContentRatingOptions>;
}
