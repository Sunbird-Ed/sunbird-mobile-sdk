import {CourseServiceImpl} from './course-service-impl';
import {Container} from 'inversify';
import {CourseBatchDetailsRequest, CourseBatchesRequest, CourseService, UnenrollCourseRequest} from '..';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {mockSdkConfigWithCourseConfig} from './course-service-impl.spec.data';
import {ApiService} from '../../api';
import {ProfileService} from '../../profile';
import {KeyValueStore} from '../../key-value-store';
import {DbService} from '../../db';
import {SharedPreferences} from '../../util/shared-preferences';
import {AuthService} from '../../auth';
import {Observable} from 'rxjs';
import { AppInfo } from '../../util/app';

describe('CourseServiceImpl', () => {
    let courseService: CourseService;

    const container = new Container();

    const mockApiService: Partial<ApiService> = {
        fetch: jest.fn(() => {
        })
    };
    const mockProfileService: Partial<ProfileService> = {
        getServerProfiles: jest.fn(() => {
        })
    };
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockDbService: Partial<DbService> = {};
    const sharePreferencesMock: Partial<SharedPreferences> = {};
    const mockAuthService: Partial<AuthService> = {
        getSession: jest.fn(() => {
        })
    };
    const mockAppInfo: Partial<AppInfo> = {};

    beforeAll(() => {
        container.bind<CourseService>(InjectionTokens.COURSE_SERVICE).to(CourseServiceImpl);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfigWithCourseConfig as SdkConfig);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(mockProfileService as ProfileService);
        container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).toConstantValue(mockKeyValueStore as KeyValueStore);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(sharePreferencesMock as SharedPreferences);
        container.bind<AuthService>(InjectionTokens.AUTH_SERVICE).toConstantValue(mockAuthService as AuthService);
        container.bind<AppInfo>(InjectionTokens.APP_INFO).toConstantValue(mockAppInfo as AppInfo);

        courseService = container.get<CourseService>(InjectionTokens.COURSE_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return instance from container', () => {
        expect(courseService).toBeTruthy();
    });

    it('should get batch details when invoked', (done) => {
        // arrange
        const request: CourseBatchDetailsRequest = {
            batchId: 'SAMPLE_BATCH_ID'
        };
        spyOn(mockApiService, 'fetch').and.returnValue(Observable.of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        // act
        courseService.getBatchDetails(request).subscribe(() => {
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should updateContentState and store it in noSql', () => {
        // arrange
        // act
        // assert
    });

    it('should getCourseBatches for particular course when invoked', (done) => {
        // arrange
        const request: CourseBatchesRequest = {
            filters: {
                courseId: 'SAMPLE_COURSE_ID'
            },
            fields: ['SAMPLE_FIELDS']
        };

        spyOn(mockApiService, 'fetch').and.returnValue(Observable.of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        spyOn(mockAuthService, 'getSession').and.returnValue(Observable.of(['SAMPLE_SESSION']));
        spyOn(mockProfileService, 'getServerProfiles').and.returnValue(Observable.of(['SAMPLE_PROFILE']));
        // act
        courseService.getCourseBatches(request).subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
            expect(mockProfileService.getServerProfiles).toHaveBeenCalled();
            done();
        });
    });

    it('should unenroll course when method is Invoked', (done) => {
        // arrange
        const request: UnenrollCourseRequest = {
            userId: 'SAMPLE_USER ID',
            courseId: 'SAMPLE_COURSE_ID',
            batchId: 'BATCH_ID'
        };
        spyOn(courseService, 'getEnrolledCourses').and.returnValues(Observable.of(['SAMPLE']));
        spyOn(mockApiService, 'fetch').and.returnValue(Observable.of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        // act
        courseService.unenrollCourse(request).subscribe(() => {
            expect(courseService.getEnrolledCourses).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
        // assert
    });
});
