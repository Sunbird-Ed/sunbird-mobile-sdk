import {
    AddActivitiesRequest,
    AddMembersRequest,
    DeleteByIdRequest,
    GetByIdRequest,
    GetMembersRequest,
    GroupAddActivitiesResponse,
    GroupAddMembersResponse,
    GroupCreateRequest,
    GroupCreateResponse,
    GroupDeleteResponse,
    GroupRemoveActivitiesResponse,
    GroupRemoveMembersResponse,
    GroupSearchCriteria,
    GroupService,
    GroupUpdateActivitiesResponse,
    GroupUpdateMembersResponse,
    GroupUpdateResponse,
    RemoveActivitiesRequest,
    RemoveMembersRequest,
    UpdateActivitiesRequest,
    UpdateByIdRequest,
    UpdateMembersRequest
} from '..';
import {Observable} from 'rxjs';
import {Group, GroupMember} from '../def/models';
import {inject, injectable} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {CsGroupService} from '@project-sunbird/client-services/services/group';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';

@injectable()
export class GroupServiceImpl implements GroupService {
    private static GROUP_LOCAL_KEY = 'GROUP-';
    private static GROUP_SEARCH_LOCAL_KEY = 'GROUP_SEARCH-';
    private static GROUP_MEMBERS_LOCAL_KEY = 'GROUP_MEMBERS-';

    constructor(
        @inject(CsInjectionTokens.GROUP_SERVICE) private groupServiceDelegate: CsGroupService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore
    ) {
    }

    create(request: GroupCreateRequest): Observable<GroupCreateResponse> {
        return this.groupServiceDelegate.create(request);
    }

    getById(request: GetByIdRequest): Observable<Group> {
        return this.cachedItemStore[request.from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
            `${request.id}${request.includeMembers ? '-' + request.includeMembers : ''}`,
            GroupServiceImpl.GROUP_LOCAL_KEY,
            'ttl_' + GroupServiceImpl.GROUP_LOCAL_KEY,
            () => this.groupServiceDelegate.getById(request.id, request.includeMembers),
        );
    }

    search({request, from}: GroupSearchCriteria): Observable<Group[]> {
        return this.cachedItemStore[from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
            `${request.filters.memberId}`,
            GroupServiceImpl.GROUP_SEARCH_LOCAL_KEY,
            'ttl_' + GroupServiceImpl.GROUP_SEARCH_LOCAL_KEY,
            () => this.groupServiceDelegate.search(request),
        );
    }

    updateById(request: UpdateByIdRequest): Observable<GroupUpdateResponse> {
        return this.groupServiceDelegate.updateById(request.id, request.updateRequest);
    }

    deleteById(request: DeleteByIdRequest): Observable<GroupDeleteResponse> {
        return this.groupServiceDelegate.deleteById(request.id);
    }

    getMembers({from, groupId}: GetMembersRequest): Observable<GroupMember[]> {
        return this.cachedItemStore[from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
            `${groupId}`,
            GroupServiceImpl.GROUP_MEMBERS_LOCAL_KEY,
            'ttl_' + GroupServiceImpl.GROUP_MEMBERS_LOCAL_KEY,
            () => this.groupServiceDelegate.getMembers(groupId),
        );
    }

    addMembers(request: AddMembersRequest): Observable<GroupAddMembersResponse> {
        return this.groupServiceDelegate.addMembers(request.groupId, request.addMembersRequest);
    }

    updateMembers(request: UpdateMembersRequest): Observable<GroupUpdateMembersResponse> {
        return this.groupServiceDelegate.updateMembers(request.groupId, request.updateMembersRequest);
    }

    removeMembers(request: RemoveMembersRequest): Observable<GroupRemoveMembersResponse> {
        return this.groupServiceDelegate.removeMembers(request.groupId, request.removeMembersRequest);
    }

    addActivities(request: AddActivitiesRequest): Observable<GroupAddActivitiesResponse> {
        return this.groupServiceDelegate.addActivities(request.groupId, request.addActivitiesRequest);
    }

    updateActivities(request: UpdateActivitiesRequest): Observable<GroupUpdateActivitiesResponse> {
        return this.groupServiceDelegate.updateActivities(request.groupId, request.updateActivitiesRequest);
    }

    removeActivities(request: RemoveActivitiesRequest): Observable<GroupRemoveActivitiesResponse> {
        return this.groupServiceDelegate.removeActivities(request.groupId, request.removeActivitiesRequest);
    }
}
