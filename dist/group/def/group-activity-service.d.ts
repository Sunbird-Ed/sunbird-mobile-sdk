import { GroupActivityDataAggregationRequest } from './requests';
import { Observable } from 'rxjs';
import { GroupActivityDataAggregation } from './responses';
export interface GroupActivityService {
    getDataAggregation(request: GroupActivityDataAggregationRequest): Observable<GroupActivityDataAggregation>;
    getDataForDashlets(hierarchyData: any, aggData: any): Observable<any>;
}
