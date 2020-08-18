import { EnrollCourseHandler } from './enroll-course-handler';
import { ApiService, TelemetryService } from '../..';
import { CourseServiceConfig, EnrollCourseRequest } from '..';
import { of, throwError } from 'rxjs';
import { CsResponse, CsHttpResponseCode } from '@project-sunbird/client-services/core/http-service';
import { TelemetryLogger } from '../../telemetry/util/telemetry-logger';
// import { TelemetryLogger } from '../../telemetry/util/telemetry-logger';

describe('EnrollCourseHandler', () => {
    let enrollCourseHandler: EnrollCourseHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockCourseServiceConfig: Partial<CourseServiceConfig> = {};
    const mockTelemetryService: Partial<TelemetryService> = {};

    beforeAll(() => {
        enrollCourseHandler = new EnrollCourseHandler(
            mockApiService as ApiService,
            mockCourseServiceConfig as CourseServiceConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of enrollCourseHandler', () => {
        expect(enrollCourseHandler).toBeTruthy();
    });

    it('should return success message for enrolled course', (done) => {
        const request: EnrollCourseRequest = {
            userId: 'sample-user-id',
            courseId: 'sample-course-id',
            batchId: 'sample-batch-id',
            batchStatus: 2
        };
        mockCourseServiceConfig.apiPath = 'http://sample-api-path'
        const response = {
            responseCode: CsHttpResponseCode.HTTP_BAD_REQUEST,
            errorMesg: 'error',
            body: {
                result: {
                    response: 'SUCCESS'
                }
            },
            headers: ''
        } as any;
        mockApiService.fetch = jest.fn(() => of(response)) as any;
        mockTelemetryService.audit = jest.fn(() => of(true));
        // act
        enrollCourseHandler.handle(request).subscribe(() => {
            done();
        }, (e) => {
            done();
        });
    });
});
