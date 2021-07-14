import { FrameworkUtilService } from './framework-util-service';
import { SharedPreferences } from '../../util/shared-preferences';
import { CategoryTerm, Channel, Framework, FrameworkService, GetActiveChannelRequest, GetFrameworkCategoryTermsRequest } from '..';
import { Observable } from 'rxjs';
import { GetSuggestedFrameworksRequest } from './requests';
import { ProfileService } from '../../profile';
export declare class FrameworkUtilServiceImpl implements FrameworkUtilService {
    private sharedPreferences;
    private frameworkService;
    private profileService;
    constructor(sharedPreferences: SharedPreferences, frameworkService: FrameworkService, profileService: ProfileService);
    getActiveChannel(getActiveChannelRequest?: GetActiveChannelRequest): Observable<Channel>;
    getActiveChannelSuggestedFrameworkList(getSuggestedFrameworksRequest: GetSuggestedFrameworksRequest): Observable<Framework[]>;
    getFrameworkCategoryTerms(request: GetFrameworkCategoryTermsRequest): Observable<CategoryTerm[]>;
}
