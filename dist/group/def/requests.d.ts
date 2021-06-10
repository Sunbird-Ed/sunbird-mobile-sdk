import { CsGroupAddActivitiesRequest, CsGroupAddMembersRequest, CsGroupRemoveActivitiesRequest, CsGroupRemoveMembersRequest, CsGroupSearchCriteria, CsGroupUpdateActivitiesRequest, CsGroupUpdateMembersRequest, CsGroupUpdateRequest } from '@project-sunbird/client-services/services/group';
import { CachedItemRequest } from '../../key-value-store';
import { Group, GroupActivity } from './models';
export { CsGroupCreateRequest as GroupCreateRequest } from '@project-sunbird/client-services/services/group';
export interface GetByIdRequest extends CachedItemRequest {
    id: string;
    userId: string;
    options?: {
        includeMembers?: boolean;
        includeActivities?: boolean;
        groupActivities?: boolean;
    };
}
export interface GroupSearchCriteria extends CachedItemRequest {
    request: CsGroupSearchCriteria;
}
export interface UpdateByIdRequest {
    id: string;
    updateRequest: CsGroupUpdateRequest;
}
export interface DeleteByIdRequest {
    id: string;
}
export interface AddMembersRequest {
    groupId: string;
    addMembersRequest: CsGroupAddMembersRequest;
}
export interface UpdateMembersRequest {
    groupId: string;
    updateMembersRequest: CsGroupUpdateMembersRequest;
}
export interface RemoveMembersRequest {
    groupId: string;
    removeMembersRequest: CsGroupRemoveMembersRequest;
}
export interface AddActivitiesRequest {
    groupId: string;
    addActivitiesRequest: CsGroupAddActivitiesRequest;
}
export interface UpdateActivitiesRequest {
    groupId: string;
    updateActivitiesRequest: CsGroupUpdateActivitiesRequest;
}
export interface RemoveActivitiesRequest {
    groupId: string;
    removeActivitiesRequest: CsGroupRemoveActivitiesRequest;
}
export interface GroupActivityDataAggregationRequest extends CachedItemRequest {
    groupId: string;
    activity: Pick<GroupActivity, 'id' | 'type'>;
    mergeGroup?: Group;
    leafNodesCount?: number;
}
export interface ActivateAndDeactivateByIdRequest {
    id: string;
}
