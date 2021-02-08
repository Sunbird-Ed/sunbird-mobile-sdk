
import { FrameworkUtilServiceImpl } from './framework-util-service-impl';
import {
    SharedPreferences, ProfileService, Channel,
    Framework, GetSuggestedFrameworksRequest, FrameworkCategoryCode,
    Profile, ProfileType, ProfileSource, ServerProfile, GetFrameworkCategoryTermsRequest
} from '../..';
import { FrameworkService } from '..';
import { of } from 'rxjs';
import { User } from '@project-sunbird/client-services/models';
import { GetFrameworkCategoryTermsHandler } from '../handler/get-framework-category-terms-handler';

jest.mock('../handler/get-framework-category-terms-handler');

describe('FrameworkUtilServiceImpl', () => {
    let frameworkUtilServiceImpl: FrameworkUtilServiceImpl;
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockProfileService: Partial<ProfileService> = {};

    beforeAll(() => {
        frameworkUtilServiceImpl = new FrameworkUtilServiceImpl(
            mockSharedPreferences as SharedPreferences,
            mockFrameworkService as FrameworkService,
            mockProfileService as ProfileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of frameworkUtilServiceImpl', () => {
        expect(frameworkUtilServiceImpl).toBeTruthy();
    });

    it('should return active channel and channel details', (done) => {
        // arrange
        mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('{"channelId": "sample-channel-id"}'));
        const response: Channel = {
            identifier: 'sample-id',
            code: 'sample-code',
            consumerId: 'consumer-id',
            channel: 'sample-channel',
            description: 'sample-des',
            createdOn: 'creator',
            versionKey: 'sample-ver-key',
            appId: 'sample-app-id',
            name: 'sample-name',
            lastUpdatedOn: 'updated-on: 20202/01/01',
            defaultFramework: 'deft-frm',
            status: '2',
            frameworks: [
                {
                    name: 'sample-name',
                    identifier: 'sample-id',
                    categories: [{
                        identifier: 'sample-id',
                        code: 'sample-code',
                        name: 'sample-name',
                        description: 'des',
                        index: 1,
                        status: '2',
                        terms: [{
                            identifier: 'sample-id',
                            code: 'code',
                            name: 'name',
                            index: 1,
                            category: 'sam',
                            status: '2',
                            associations: [{
                                identifier: 'sample-id',
                                code: 'sample-code',
                                name: 'sample-name',
                                category: 'des',
                                status: '2',
                            }]
                        }]
                    }]
                }
            ]
        };
        mockFrameworkService.getChannelDetails = jest.fn().mockImplementation(() => of(response));
        // act
        frameworkUtilServiceImpl.getActiveChannel().subscribe(() => {
            // assert
            expect(mockFrameworkService.getActiveChannelId).toHaveBeenCalled();
            expect(mockFrameworkService.getChannelDetails).toHaveBeenCalled();
            done();
        });
    });

    describe('getActiveChannelSuggestedFrameworkList', () => {
        it('should return suggested framework if framework is available on channel', (done) => {
            // arrange
            const request: GetSuggestedFrameworksRequest = {
                language: 'english',
                requiredCategories: [FrameworkCategoryCode.BOARD, FrameworkCategoryCode.MEDIUM, FrameworkCategoryCode.GRADE_LEVEL],
                //  ignoreActiveChannel?: boolean;
            };
            const serverData: Partial<User> = {
                userId: 'sample-user-id',
                id: 'sample-id',
                firstName: 'f-name'
            };
            const response: Framework = {
                name: 'sample-name',
                identifier: 'sample-id'
            };
            mockProfileService.getActiveSessionProfile = jest.fn().mockImplementation(() => of({ serverProfile: serverData }));
            mockFrameworkService.getFrameworkDetails = jest.fn().mockImplementation(() => of(response));
            // act
            frameworkUtilServiceImpl.getActiveChannelSuggestedFrameworkList(request).subscribe(() => {
                // assert
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                done();
            });
        });

        it('should return suggested framework if framework is not available on channel', (done) => {
            // arrange
            const request: GetSuggestedFrameworksRequest = {
                language: 'english',
                requiredCategories: [FrameworkCategoryCode.BOARD, FrameworkCategoryCode.MEDIUM, FrameworkCategoryCode.GRADE_LEVEL],
                //  ignoreActiveChannel?: boolean;
            };
            const serverData: Partial<User> = {
                userId: 'sample-user-id',
                id: 'sample-id',
                firstName: 'f-name'
            };
            const response: Framework = {
                name: 'sample-name',
                identifier: 'sample-id'
            };
            mockFrameworkService.getChannelDetails = jest.fn().mockImplementation(() => of({}));
            mockProfileService.getActiveSessionProfile = jest.fn().mockImplementation(() => of({ serverProfile: serverData }));
            mockFrameworkService.getFrameworkDetails = jest.fn().mockImplementation(() => of(response));
            // act
            frameworkUtilServiceImpl.getActiveChannelSuggestedFrameworkList(request).subscribe(() => {
                // assert
                expect(mockFrameworkService.getChannelDetails).toHaveBeenCalled();
                expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
                expect(mockFrameworkService.getFrameworkDetails).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should return framework category using GetFrameworkCategoryTermsHandler', (done) => {
        // arrange
        const request: GetFrameworkCategoryTermsRequest = {
            requiredCategories: [FrameworkCategoryCode.BOARD, FrameworkCategoryCode.MEDIUM, FrameworkCategoryCode.GRADE_LEVEL],
            currentCategoryCode: 'sample-cur-category-code',
            language: 'english'
        };
        const response = [{ code: 'sample-code', identifier: 'sample-id' }];
        (GetFrameworkCategoryTermsHandler as jest.Mock<GetFrameworkCategoryTermsHandler>).mockImplementation(() => {
            return {
                handle: jest.fn().mockImplementation(() => of(response))
            } as Partial<GetFrameworkCategoryTermsHandler> as GetFrameworkCategoryTermsHandler;
        });
        // act
        frameworkUtilServiceImpl.getFrameworkCategoryTerms(request).subscribe((e) => {
            // assert
            expect(e).toBe(response);
            done();
        });
    });
});
