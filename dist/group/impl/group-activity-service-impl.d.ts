import { GroupActivityDataAggregation, GroupActivityDataAggregationRequest, GroupActivityService } from '..';
import { Observable } from 'rxjs';
import { CsGroupActivityService } from '@project-sunbird/client-services/services/group/activity';
import { CachedItemStore } from '../../key-value-store';
export declare class GroupActivityServiceImpl implements GroupActivityService {
    private groupActivityService;
    private cachedItemStore;
    private static readonly GROUP_ACTIVITY_DATA_AGGREGATION_KEY;
    constructor(groupActivityService: CsGroupActivityService, cachedItemStore: CachedItemStore);
    getDataAggregation(request: GroupActivityDataAggregationRequest): Observable<GroupActivityDataAggregation>;
    getDataForDashlets(hierarchyData: any, aggData: any): Observable<any>;
}
