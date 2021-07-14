import {GroupActivityDataAggregation, GroupActivityDataAggregationRequest, GroupActivityService} from '..';
import {Observable} from 'rxjs';
import {CsGroupActivityService} from '@project-sunbird/client-services/services/group/activity';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';

export class GroupActivityServiceImpl implements GroupActivityService {
    private static readonly GROUP_ACTIVITY_DATA_AGGREGATION_KEY = 'GROUP_ACTIVITY_DATA_AGGREGATION-';

    constructor(
        private groupActivityService: CsGroupActivityService,
        private cachedItemStore: CachedItemStore
    ) {
    }

    getDataAggregation(request: GroupActivityDataAggregationRequest): Observable<GroupActivityDataAggregation> {
        return this.cachedItemStore[request.from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
          `group-${request.groupId}-activity-${request.activity.id}-${request.activity.type}`,
          GroupActivityServiceImpl.GROUP_ACTIVITY_DATA_AGGREGATION_KEY,
          'ttl_' + GroupActivityServiceImpl.GROUP_ACTIVITY_DATA_AGGREGATION_KEY,
          () => this.groupActivityService.getDataAggregation(request.groupId, request.activity, request.mergeGroup, request.leafNodesCount),
        );
    }

    getDataForDashlets(hierarchyData, aggData): Observable<any> {
        return this.groupActivityService.getDataForDashlets(hierarchyData, aggData);
    }
}
