import {Framework} from './framework';
import {Channel} from './channel';
import {FormRequest} from '../../form';
import {Observable} from 'rxjs';
import {ChannelDetailsRequest, FrameworkDetailsRequest, OrganizationSearchCriteria} from './requests';
import {SdkServicePreInitDelegate} from '../../sdk-service-pre-init-delegate';
import {Organization, OrganizationSearchResponse} from '..';
import {GetDefaultChannelDetailsRequest} from '..';

export interface FrameworkService extends SdkServicePreInitDelegate {
    /** @internal */
    activeChannelId?: string;

    getDefaultChannelDetails(request?: GetDefaultChannelDetailsRequest): Observable<Channel>;

    getDefaultChannelId(): Observable<string>;

    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel>;

    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework>;

    getFrameworkConfig(frameworkId: string, formRequest?: FormRequest): Observable<any>;

    searchOrganization<T extends Partial<Organization>>(request: OrganizationSearchCriteria<T>): Observable<OrganizationSearchResponse<T>>;

    setActiveChannelId(channelId: string): Observable<undefined>;

    getActiveChannelId(): Observable<string>;
}
