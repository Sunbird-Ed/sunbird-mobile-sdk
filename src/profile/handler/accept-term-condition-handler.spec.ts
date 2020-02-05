import {AcceptTermConditionHandler} from './accept-term-condition-handler';
import {AcceptTermsConditionRequest, ApiService, ProfileServiceConfig} from '../..';
import {mockProfileServiceConfig} from './accept-term-condition-handler.spec.data';
import {of} from 'rxjs';

describe('GetDeviceProfileHandler', () => {
    let acceptTermConditionHandler: AcceptTermConditionHandler;

    const mockApiService: Partial<ApiService> = {};

    beforeAll(() => {
        acceptTermConditionHandler = new AcceptTermConditionHandler(
            mockApiService as ApiService,
            mockProfileServiceConfig as ProfileServiceConfig,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of acceptTermConditionHandler', () => {
        expect(acceptTermConditionHandler).toBeTruthy();
    });

    it('should handle success scenario for AcceptTermsConditions', (done) => {
        // arrange
        const request: AcceptTermsConditionRequest = {
            version: ''
        };
        mockApiService.fetch = jest.fn().mockImplementation(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({
                body: {
                    result: {
                        response: 'SUCCESS'
                    }
                }
            }
        ));
        // act
        acceptTermConditionHandler.handle(request).subscribe((v) => {
            expect(v).toEqual(true);
            // assert
            done();
        });
    });

    it('should handle failure scenario for AcceptTermsConditions', (done) => {
        // arrange
        const request: AcceptTermsConditionRequest = {
            version: ''
        };
        mockApiService.fetch = jest.fn().mockImplementation(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({
                body: {
                    result: {
                        response: 'SUCC'
                    }
                }
            }
        ));
        // act
        acceptTermConditionHandler.handle(request).subscribe((v) => {
            expect(v).toEqual(false);
            // assert
            done();
        });
    });

});
