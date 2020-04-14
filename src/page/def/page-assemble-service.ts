import {PageAssembleCriteria, SetPageAssembleChannelRequest} from './requests';
import {Observable} from 'rxjs';
import {PageAssemble} from './page-assemble';

export interface PageAssembleService {
    setPageAssembleChannel(request: SetPageAssembleChannelRequest): void;

    getPageAssemble(criteria: PageAssembleCriteria): Observable<PageAssemble>;
}
