import { GetFaqRequest } from './get-faq-request';
import { Faq } from '..';
import { Observable } from 'rxjs';


export interface FaqService {
    getFaqDetails(request: GetFaqRequest): Observable<Faq>;
}
