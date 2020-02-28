import { GetEnrolledCourseHandler } from './get-enrolled-course-handler';
import { KeyValueStore, ApiService, SharedPreferences } from '../..';
import { CourseServiceConfig, FetchEnrolledCourseRequest } from '..';
import { of } from 'rxjs';
import { GetEnrolledCourseResponse } from '../def/get-enrolled-course-response';

describe('GetEnrolledCourseHandler', () => {
    let getEnrolledCourseHandler: GetEnrolledCourseHandler;
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockCourseServiceConfig: Partial<CourseServiceConfig> = {};
    const mockSharedPreference: Partial<SharedPreferences> = {};

    beforeAll(() => {
        getEnrolledCourseHandler = new GetEnrolledCourseHandler(
            mockKeyValueStore as KeyValueStore,
            mockApiService as ApiService,
            mockCourseServiceConfig as CourseServiceConfig,
            mockSharedPreference as SharedPreferences
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of getEnrolledCourseHandler', () => {
        expect(getEnrolledCourseHandler).toBeTruthy();
    });

    it('should fetch course from server if keyvalue unavailable', (done) => {
        // arrange
        const request: FetchEnrolledCourseRequest = {
            userId: 'uid-1234589',
            returnFreshCourses: true
        };
        mockKeyValueStore.getValue = jest.fn(() => of(undefined));
        mockKeyValueStore.setValue = jest.fn(() => of(true));
        mockApiService.fetch = jest.fn(() => of({body: {  result: {
            courses: {result: {}},
        }}}));
        getEnrolledCourseHandler = new GetEnrolledCourseHandler(
            mockKeyValueStore as KeyValueStore,
            mockApiService as ApiService,
            mockCourseServiceConfig as CourseServiceConfig,
            mockSharedPreference as SharedPreferences
        );
        // act
        getEnrolledCourseHandler.handle(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });

    });

    it('should fetch course from server if keyvalue available', (done) => {
        // arrange
        const request: FetchEnrolledCourseRequest = {
            userId: 'uid-1234589',
            returnFreshCourses: true
        };
        mockKeyValueStore.getValue = jest.fn(() => of('diksha-user'));
        mockApiService.fetch = jest.fn(() => of({body: {  result: {
            courses: {result: {}},
        }}}));
        mockKeyValueStore.setValue = jest.fn(() => of(true));
        // act
        getEnrolledCourseHandler.handle(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalled();
            expect(mockKeyValueStore.setValue).toHaveBeenCalled();
            done();
        });
    });

    it('should fetch course from server if keyvalue available for catch part', (done) => {
        // arrange
        getEnrolledCourseHandler = new GetEnrolledCourseHandler(
            mockKeyValueStore as KeyValueStore,
            mockApiService as ApiService,
            mockCourseServiceConfig as CourseServiceConfig,
            mockSharedPreference as SharedPreferences
        );
        const request: FetchEnrolledCourseRequest = {
            userId: 'uid-1234589',
            returnFreshCourses: true
        };
        const data: GetEnrolledCourseResponse = {
            id: 'sid',
            params: { resmsgid: 'string' },
            result: {
                courses: [{}],
            }
        };
        mockKeyValueStore.getValue = jest.fn(() => of('diksha-user'));
        mockApiService.fetch = jest.fn(() => of(data));
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return data;
          });
        // act
        getEnrolledCourseHandler.handle(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });

    it('should fetch course from server if keyvalue unavailable', (done) => {
        // arrange
        const request: FetchEnrolledCourseRequest = {
            userId: 'uid-1234589',
            returnFreshCourses: false
        };
        const data: GetEnrolledCourseResponse = {
            id: 'sid',
            params: { resmsgid: 'string' },
            result: {
                courses: [{}],
            }
        };
        mockKeyValueStore.getValue = jest.fn(() => of('undefined'));
        mockApiService.fetch = jest.fn(() => of(data));
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return data;
          });
        getEnrolledCourseHandler = new GetEnrolledCourseHandler(
            mockKeyValueStore as KeyValueStore,
            mockApiService as ApiService,
            mockCourseServiceConfig as CourseServiceConfig,
            mockSharedPreference as SharedPreferences
        );
        // act
        getEnrolledCourseHandler.handle(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });

    });
});
