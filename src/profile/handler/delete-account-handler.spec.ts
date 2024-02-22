import { DeleteAccountHandler } from './delete-account-handler';
import {ApiService, ProfileServiceConfig} from '../..';
import {of} from 'rxjs';
import {mockProfileServiceConfig} from './accept-term-condition-handler.spec.data';

describe('DeleteAccountHandler', () => {
    let deleteAccountHandler: DeleteAccountHandler;

    const mockApiService: Partial<ApiService> = {};

    beforeAll(() => {
        deleteAccountHandler = new DeleteAccountHandler(
            mockApiService as ApiService,
            mockProfileServiceConfig as ProfileServiceConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of DeleteAccountHandler', () => {
        expect(deleteAccountHandler).toBeTruthy();
    });


    it('should get the data from DeleteAccountHandler', (done) => {
        // arrange
        mockApiService.fetch = jest.fn().mockImplementation(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({
                body: {
                    result: {}
                }
            }
        ));

        const request = {
            userId: 'sample_userId'
        };

        // act
        deleteAccountHandler.handle(request).subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });

});