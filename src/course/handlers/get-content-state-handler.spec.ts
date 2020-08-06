import {GetContentStateHandler} from './get-content-state-handler';
import {ApiService, Response} from '../../api';
import {CourseServiceConfig} from '..';
import {Content, ContentService} from '../../content';
import {of} from 'rxjs';

describe('GetContentStateHandler', () => {
    let getContentStateHandler: GetContentStateHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockCourseServiceConfig: CourseServiceConfig = {
        apiPath: '/mock/api/path'
    };
    const mockContentService: Partial<ContentService> = {};

    beforeEach(() => {

        getContentStateHandler = new GetContentStateHandler(
            mockApiService as ApiService,
            mockCourseServiceConfig,
            mockContentService as ContentService
        );
    });

    it('should be able to create an instance', () => {
        expect(getContentStateHandler).toBeTruthy();
    });

    describe('handle()', () => {
        describe('when leafNode contentIds is passed for requesting root content', () => {
            it('should invoke API call with no modifications to request', (done) => {
                // arrange
                mockApiService.fetch = jest.fn(() => {
                    const response = new Response();
                    response.responseCode = 200;
                    response.body = {};
                    return of(response);
                });

                const request = {
                    userId: 'SOME_USER_ID',
                    batchId: 'SOME_BATCH_ID',
                    courseId: 'SOME_BATCH_ID',
                    contentIds: [
                        'SOME_LEAF_CONTENT_ID'
                    ]
                };

                // act
                getContentStateHandler.handle(request).subscribe(() => {
                    expect(mockApiService.fetch).toHaveBeenCalledWith(expect.objectContaining({
                        body: {
                            request
                        }
                    }));
                    done();
                });
            });
        });

        describe('when leafNode contentIds is not passed for requesting root content', () => {
            describe('when requesting for single courseId', () => {
                it('should invoke API call attaching single course leafNodes to request', (done) => {
                    // arrange
                    mockApiService.fetch = jest.fn(() => {
                        const response = new Response();
                        response.responseCode = 200;
                        response.body = {};
                        return of(response);
                    });

                    mockContentService.getContentDetails = jest.fn(() => {
                        return of({
                            contentData: {
                                leafNodes: [
                                    'SOME_LEAF_NODE_1',
                                    'SOME_LEAF_NODE_2'
                                ],
                                leafNodesCount: 2
                            } as any
                        } as Partial<Content> as Content);
                    });

                    const request = {
                        userId: 'SOME_USER_ID',
                        batchId: 'SOME_BATCH_ID',
                        courseId: 'SOME_BATCH_ID',
                        contentIds: []
                    };

                    // act
                    getContentStateHandler.handle(request).subscribe(() => {
                        expect(mockApiService.fetch).toHaveBeenCalledWith(expect.objectContaining({
                            body: {
                                request: expect.objectContaining({
                                    userId: 'SOME_USER_ID',
                                    batchId: 'SOME_BATCH_ID',
                                    courseId: 'SOME_BATCH_ID',
                                    contentIds: [
                                        'SOME_LEAF_NODE_1',
                                        'SOME_LEAF_NODE_2'
                                    ]
                                })
                            }
                        }));
                        done();
                    });
                });
            });

            describe('when requesting for multiple courseIds', () => {
                it('should invoke API call attaching multiple course leafNodes to request', (done) => {
                    // arrange
                    mockApiService.fetch = jest.fn(() => {
                        const response = new Response();
                        response.responseCode = 200;
                        response.body = {};
                        return of(response);
                    });

                    const responseStack = [
                        [
                            'SOME_LEAF_NODE_1',
                            'SOME_LEAF_NODE_2'
                        ],
                        [
                            'SOME_LEAF_NODE_3',
                            'SOME_LEAF_NODE_4'
                        ],
                    ];
                    mockContentService.getContentDetails = jest.fn(() => {
                        return of({
                            contentData: {
                                leafNodes: responseStack.shift(),
                                leafNodesCount: 2
                            } as any
                        } as Partial<Content> as Content);
                    });

                    const request = {
                        userId: 'SOME_USER_ID',
                        batchId: 'SOME_BATCH_ID',
                        courseIds: ['SOME_BATCH_ID_1', 'SOME_BATCH_ID_2']
                    };

                    // act
                    getContentStateHandler.handle(request).subscribe(() => {
                        expect(mockApiService.fetch).toHaveBeenCalledWith(expect.objectContaining({
                            body: {
                                request: expect.objectContaining({
                                    userId: 'SOME_USER_ID',
                                    batchId: 'SOME_BATCH_ID',
                                    courseIds: [
                                        'SOME_BATCH_ID_1',
                                        'SOME_BATCH_ID_2'
                                    ],
                                    contentIds: [
                                        'SOME_LEAF_NODE_1',
                                        'SOME_LEAF_NODE_2',
                                        'SOME_LEAF_NODE_3',
                                        'SOME_LEAF_NODE_4'
                                    ]
                                })
                            }
                        }));
                        done();
                    });
                });
            });
        });
    });
});
