import { ApiRequestHandler } from '../../../api';
import { PageAssembleCriteria } from '../..';
import { PageAssemble } from '../..';
import { Observable } from 'rxjs';
import { DefaultRequestDelegate } from './default-request-delegate';
import { AuthService } from '../../../auth';
import { FrameworkService } from '../../../framework';
import { SystemSettingsService } from '../../../system-settings';
export declare class CourseRequestDelegate implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private defaultDelegate;
    private authService;
    private frameworkService;
    private systemSettingsService;
    private static readonly SSO_COURSE_SECTION_ID;
    private ssoSectionIdMap;
    constructor(defaultDelegate: DefaultRequestDelegate, authService: AuthService, frameworkService: FrameworkService, systemSettingsService: SystemSettingsService);
    handle(request: PageAssembleCriteria): Observable<PageAssemble>;
}
