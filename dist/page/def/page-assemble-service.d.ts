import { PageAssembleCriteria } from './requests';
import { Observable } from 'rxjs';
import { PageAssemble } from './page-assemble';
export interface PageAssembleService {
    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble>;
}
