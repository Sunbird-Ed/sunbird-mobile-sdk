import {Observable} from 'rxjs';
import {Group} from './models';
import {
    AddActivitiesRequest,
    AddMembersRequest,
    DeleteByIdRequest,
    GetByIdRequest,
    GroupCreateRequest,
    GroupSearchCriteria,
    RemoveActivitiesRequest,
    RemoveMembersRequest,
    UpdateActivitiesRequest,
    UpdateByIdRequest,
    UpdateMembersRequest
} from './requests';
import {
    GroupAddActivitiesResponse,
    GroupAddMembersResponse,
    GroupCreateResponse,
    GroupDeleteResponse,
    GroupRemoveActivitiesResponse,
    GroupRemoveMembersResponse,
    GroupUpdateActivitiesResponse,
    GroupUpdateMembersResponse,
    GroupUpdateResponse
} from './responses';

export interface GroupService {
    create(request: GroupCreateRequest): Observable<GroupCreateResponse>;

    getById(request: GetByIdRequest): Observable<Group>;

    search(request: GroupSearchCriteria): Observable<Group[]>;

    updateById(request: UpdateByIdRequest): Observable<GroupUpdateResponse>;

    deleteById(request: DeleteByIdRequest): Observable<GroupDeleteResponse>;

    addMembers(request: AddMembersRequest): Observable<GroupAddMembersResponse>;

    updateMembers(request: UpdateMembersRequest): Observable<GroupUpdateMembersResponse>;

    removeMembers(request: RemoveMembersRequest): Observable<GroupRemoveMembersResponse>;

    addActivities(request: AddActivitiesRequest): Observable<GroupAddActivitiesResponse>;

    updateActivities(request: UpdateActivitiesRequest): Observable<GroupUpdateActivitiesResponse>;

    removeActivities(request: RemoveActivitiesRequest): Observable<GroupRemoveActivitiesResponse>;
}
