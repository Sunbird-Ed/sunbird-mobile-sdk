import { Faq } from '..';
import { Observable } from 'rxjs';


export interface FaqService {
    getFaqDetails(language?: string): Observable<Faq>;
}
