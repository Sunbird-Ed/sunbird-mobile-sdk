import { ApiRequestHandler } from '../../../api';
import { PageAssembleCriteria } from '../..';
import { PageAssemble } from '../..';
import { Observable } from 'rxjs';
import { DefaultRequestDelegate } from './default-request-delegate';
import { DbService } from '../../../db';
export declare class DialcodeRequestDelegate implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private defaultDelegate;
    private dbService;
    constructor(defaultDelegate: DefaultRequestDelegate, dbService: DbService);
    handle(request: PageAssembleCriteria): Observable<PageAssemble>;
    private buildPageAssembleWithLocalContents;
    private mergePageAssembleWithLocalContents;
    private mergePageAssembleWithLocalCollections;
}
