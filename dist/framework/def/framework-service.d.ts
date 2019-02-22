import { Framework } from './framework';
import { Channel } from './channel';
import { Observable } from 'rxjs';
import { ChannelDetailsRequest, FrameworkDetailsRequest, OrganizationSearchCriteria } from './request-types';
import { Organization } from './Organization';
export interface FrameworkService {
    activeChannel$: Observable<Channel | undefined>;
    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel>;
    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework>;
    persistFrameworkDetails(request: Framework): Observable<boolean>;
    setActiveChannel(channel: Channel): any;
    searchOrganization<T>(request: OrganizationSearchCriteria<T>): Observable<Organization<T>>;
}
