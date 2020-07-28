import {
    AddActivitiesRequest,
    AddMembersRequest,
    DeleteByIdRequest,
    GetByIdRequest,
    GroupActivityService,
    GroupAddActivitiesResponse,
    GroupAddMembersResponse,
    GroupCreateRequest,
    GroupCreateResponse,
    GroupDeleteResponse,
    GroupRemoveActivitiesResponse,
    GroupRemoveMembersResponse,
    GroupSearchCriteria,
    GroupSearchResponse,
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
import {Group} from '../def/models';
import {Container, inject, injectable} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {CsGroupService} from '@project-sunbird/client-services/services/group';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';
import {GroupActivityServiceImpl} from './group-activity-service-impl';

@injectable()
export class GroupServiceImpl implements GroupService {
    private static GROUP_LOCAL_KEY = 'GROUP-';
    private static GROUP_SEARCH_LOCAL_KEY = 'GROUP_SEARCH-';

    private _groupActivityService: GroupActivityService;

    get activityService(): GroupActivityService {
        if (!this._groupActivityService) {
            this._groupActivityService = new GroupActivityServiceImpl(
                this.groupServiceDelegate.activityService,
                this.cachedItemStore
            );
        }

        return this._groupActivityService;
    }

    constructor(
        @inject(InjectionTokens.CONTAINER) private container: Container,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore
    ) {
    }

    private get groupServiceDelegate(): CsGroupService {
        return this.container.get(CsInjectionTokens.GROUP_SERVICE);
    }

    create(request: GroupCreateRequest): Observable<GroupCreateResponse> {
        return this.groupServiceDelegate.create(request);
    }

    getById(request: GetByIdRequest): Observable<Group> {
        return this.cachedItemStore[request.from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
            `${request.id}-${request.userId}` +
            `${(request.options && request.options.includeMembers) ? '-' + request.options.includeMembers : ''}` +
            `${(request.options && request.options.includeActivities) ? '-' + request.options.includeActivities : ''}`,
            GroupServiceImpl.GROUP_LOCAL_KEY,
            'ttl_' + GroupServiceImpl.GROUP_LOCAL_KEY,
            () => this.groupServiceDelegate.getById(request.id, request.options),
        );
    }

    search({request, from}: GroupSearchCriteria): Observable<GroupSearchResponse[]> {
        return this.cachedItemStore[from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
            `${request.filters.userId}`,
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
