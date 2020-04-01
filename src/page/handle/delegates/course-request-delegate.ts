import {ApiRequestHandler} from '../../../api';
import {PageAssembleCriteria} from '../..';
import {PageAssemble} from '../..';
import {defer, Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {DefaultRequestDelegate} from './default-request-delegate';
import {AuthService} from '../../../auth';
import {FrameworkService} from '../../../framework';
import {SystemSettingsService} from '../../../system-settings';

export class CourseRequestDelegate implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    private static readonly SSO_COURSE_SECTION_ID = 'ssoCourseSection';

    private ssoSectionIdMap = new Map<string, string>();

    constructor(
        private defaultDelegate: DefaultRequestDelegate,
        private authService: AuthService,
        private frameworkService: FrameworkService,
        private systemSettingsService: SystemSettingsService,
    ) {
    }

    handle(request: PageAssembleCriteria): Observable<PageAssemble> {
        return defer(async () => {
            const isProfileLoggedIn = !!(await this.authService.getSession().toPromise());

            if (!isProfileLoggedIn) {
                return request;
            }

            const defaultChannelId = await this.frameworkService.getDefaultChannelId().toPromise();
            const activeChannelId = this.frameworkService.activeChannelId!;
            const isDefaultChannelProfile = activeChannelId === defaultChannelId;

            if (!isDefaultChannelProfile) {
                let sectionId: string | undefined;

                try {
                    const res = await this.systemSettingsService.getSystemSettings({
                        id: CourseRequestDelegate.SSO_COURSE_SECTION_ID
                    }).toPromise();

                    sectionId = res && res.value;
                } catch (e) {
                    console.error(e);
                }

                if (sectionId) {
                    request.sections = {
                        [sectionId]: {
                            filters: {
                                'batches.createdFor': [activeChannelId]
                            }
                        }
                    };

                    this.ssoSectionIdMap.set(request.name + '-' + activeChannelId, sectionId);
                }
            }

            return request;
        }).pipe(
            mergeMap((pageAssembleRequest) => {
                return this.defaultDelegate.handle(pageAssembleRequest);
            }),
            map((response) => {
                const ssoPageSectionId = this.ssoSectionIdMap.get(request.name + '-' + this.frameworkService.activeChannelId);

                if (ssoPageSectionId) {
                    response.ssoSectionId = ssoPageSectionId;
                }

                return response;
            })
        );
    }
}
