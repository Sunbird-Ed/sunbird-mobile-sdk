import { Framework } from './framework';
import { Channel } from './channel';
import { Observable } from 'rxjs';
import { ChannelDetailsRequest, FrameworkDetailsRequest, OrganizationSearchCriteria } from './request-types';
import { Organization } from './Organization';
import { SdkServicePreInitDelegate } from '../../sdk-service-pre-init-delegate';
export interface FrameworkService extends SdkServicePreInitDelegate {
    /** @internal */
    activeChannelId?: string;
    getDefaultChannelDetails(): Observable<Channel>;
    getDefaultChannelId(): Observable<string>;
    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel>;
    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework>;
    searchOrganization<T>(request: OrganizationSearchCriteria<T>): Observable<Organization<T>>;
    setActiveChannelId(channelId: string): Observable<undefined>;
    getActiveChannelId(): Observable<string>;
}
