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
    UpdateMembersRequest,
    ActivateAndDeactivateByIdRequest
} from './requests';
import {
    GroupAddActivitiesResponse,
    GroupAddMembersResponse,
    GroupCreateResponse,
    GroupDeleteResponse,
    GroupReactivateResponse,
    GroupRemoveActivitiesResponse,
    GroupRemoveMembersResponse,
    GroupSearchResponse,
    GroupSupportedActivitiesFormField,
    GroupSuspendResponse,
    GroupUpdateActivitiesResponse,
    GroupUpdateMembersResponse,
    GroupUpdateResponse
} from './responses';
import {GroupActivityService} from './group-activity-service';
import {Form} from '../../form/def/models';
import { CsGroupUpdateGroupGuidelinesRequest, CsGroupUpdateGroupGuidelinesResponse } from '@project-sunbird/client-services/services/group';
export interface GroupService {
    activityService: GroupActivityService;

    create(request: GroupCreateRequest): Observable<GroupCreateResponse>;

    getById(request: GetByIdRequest): Observable<Group>;

    search(request: GroupSearchCriteria): Observable<GroupSearchResponse[]>;

    updateById(request: UpdateByIdRequest): Observable<GroupUpdateResponse>;

    deleteById(request: DeleteByIdRequest): Observable<GroupDeleteResponse>;

    addMembers(request: AddMembersRequest): Observable<GroupAddMembersResponse>;

    updateMembers(request: UpdateMembersRequest): Observable<GroupUpdateMembersResponse>;

    removeMembers(request: RemoveMembersRequest): Observable<GroupRemoveMembersResponse>;

    addActivities(request: AddActivitiesRequest): Observable<GroupAddActivitiesResponse>;

    updateActivities(request: UpdateActivitiesRequest): Observable<GroupUpdateActivitiesResponse>;

    removeActivities(request: RemoveActivitiesRequest): Observable<GroupRemoveActivitiesResponse>;

    getSupportedActivities(): Observable<Form<GroupSupportedActivitiesFormField>>;

    suspendById(request: ActivateAndDeactivateByIdRequest): Observable<GroupSuspendResponse>;

    reactivateById(request: ActivateAndDeactivateByIdRequest): Observable<GroupReactivateResponse>;

    updateGroupGuidelines(request: CsGroupUpdateGroupGuidelinesRequest): Observable<CsGroupUpdateGroupGuidelinesResponse>;
}
