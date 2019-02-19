import {FrameworkUtilService} from './framework-util-service';
import {SharedPreferences} from '../../util/shared-preferences';
import {CategoryTerm, Channel, Framework, FrameworkService, GetFrameworkCategoryTermsRequest} from '..';
import {Observable} from 'rxjs';
import {GetSuggestedFrameworksRequest} from './requests';
import {FrameworkMapper} from './framework-mapper';
import {NoActiveChannelFoundError} from '../errors/no-active-channel-found-error';
import {Profile, ProfileService} from '../../profile';
import {SystemSettingsService} from '../../system-settings';
import {GetFrameworkCategoryTermsHandler} from '../handler/get-framework-category-terms-handler';

export class FrameworkUtilServiceImpl implements FrameworkUtilService {

    private readonly SYSTEM_SETTINGS_CUSTODIAN_ORG_ID_KEY = 'custodianOrgId';

    constructor(private sharedPreferences: SharedPreferences,
                private frameworkService: FrameworkService,
                private profileService: ProfileService,
                private systemSettingsService: SystemSettingsService) {
    }

    public getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest): Observable<Framework[]> {
        return this.profileService.getActiveSessionProfile()
            .mergeMap((profile: Profile) => {
                if (profile.serverProfile) {
                    return this.frameworkService.activeChannel$
                        .map((channel) => {
                            if (!channel) {
                                throw new NoActiveChannelFoundError('No active channel found');
                            }

                            return channel;
                        });
                }

                return this.getCustodianChannel();
            })
            .mergeMap((channel: Channel) => {
                if (channel.frameworks) {
                    return Observable.of(channel.frameworks)
                        .map((frameworks) =>
                            frameworks
                                .map((f) => FrameworkMapper.prepareFrameworkCategoryAssociations(f))
                                .map((f) => FrameworkMapper.prepareFrameworkTranslations(
                                    f, getSuggestedFrameworksRequest.language)
                                )
                        );
                }

                return this.frameworkService.getFrameworkDetails({
                    frameworkId: channel.defaultFramework,
                    requiredCategories: getSuggestedFrameworksRequest.requiredCategories
                }).map((framework: Framework) => {
                    framework.index = 0;
                    return [framework];
                });
            });
    }

    getCustodianChannel(): Observable<Channel> {
        return this.systemSettingsService.getSystemSettings({id: this.SYSTEM_SETTINGS_CUSTODIAN_ORG_ID_KEY})
            .map((r) => r.value)
            .mergeMap((channelId: string) => {
                return this.frameworkService.getChannelDetails({channelId: channelId});
            });
    }

    getFrameworkCategoryTerms(request: GetFrameworkCategoryTermsRequest): Observable<CategoryTerm[]> {
        return new GetFrameworkCategoryTermsHandler(this.frameworkService).handle(request);
    }
}
