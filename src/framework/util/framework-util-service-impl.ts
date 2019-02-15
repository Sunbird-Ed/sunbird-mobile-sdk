import {FrameworkUtilService} from './framework-util-service';
import {SharedPreferences} from '../../util/shared-preferences';
import {Channel, Framework, FrameworkService} from '..';
import {PreferenceKeys} from '../../util/shared-preferences/def/preference-keys';
import {Observable} from 'rxjs';
import {GetSuggestedFramworksRequest} from './requests';

export class FrameworkUtilServiceImpl implements FrameworkUtilService {

    constructor(private sharedPreferences: SharedPreferences,
                private frameworkService: FrameworkService) {
    }

    public getSuggestedFrameworkList(getSuggestedFrameworksRequest: GetSuggestedFramworksRequest): Observable<Framework[]> {
        return Observable.fromPromise(this.sharedPreferences.getString(PreferenceKeys.ACTIVE_CHANNEL_ID))
            .mergeMap((channelId: string | null) => {
                if (!channelId) {
                    // TODO create appropriate error class
                    throw new Error('No active channel_id found');
                }

                return this.frameworkService.getChannelDetails({channelId: channelId});
            })
            .mergeMap((channel: Channel) => {
                if (channel.frameworks) {
                    return Observable.of(channel.frameworks);
                }

                return this.frameworkService.getFrameworkDetails({
                    frameworkId: channel.defaultFramework,
                    categories: getSuggestedFrameworksRequest.categories
                }).map((framework: Framework) => {
                    framework.index = 0;
                    return [framework];
                });
            });
    }
}
