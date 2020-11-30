import {GetContentStateHandler} from './get-content-state-handler';
import {ApiService, Response} from '../../api';
import {CourseServiceConfig} from '..';
import {Content, ContentService} from '../../content';
import {of} from 'rxjs';
import {Container} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {CsCourseService} from '@project-sunbird/client-services/services/course';

describe('GetContentStateHandler', () => {
    let getContentStateHandler: GetContentStateHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockCourseServiceConfig: CourseServiceConfig = {
        apiPath: '/mock/api/path'
    };
    const mockContentService: Partial<ContentService> = {};
    const mockCsCourseService: Partial<CsCourseService> = {
        getContentState: jest.fn(() => of([]))
    };

    beforeEach(() => {
        const container = new Container();
        container.bind<ContentService>(InjectionTokens.CONTENT_SERVICE).toConstantValue(mockContentService as ContentService);
        container.bind<CsCourseService>(CsInjectionTokens.COURSE_SERVICE).toConstantValue(mockCsCourseService as CsCourseService);
        container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(container as Container);

        getContentStateHandler = new GetContentStateHandler(
            mockApiService as ApiService,
            mockCourseServiceConfig,
            container
        );
    });

    it('should be able to create an instance', () => {
        expect(getContentStateHandler).toBeTruthy();
    });

    describe('handle()', () => {
        describe('when leafNode contentIds is passed for requesting root content', () => {
            it('should invoke API call with no modifications to request', (done) => {
                // arrange
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
                    expect(mockCsCourseService.getContentState).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('when leafNode contentIds is not passed for requesting root content', () => {
            it('should invoke API call attaching course leafNodes to request', (done) => {
                // arrange
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
                    expect(mockCsCourseService.getContentState).toHaveBeenCalledWith(expect.objectContaining({
                        userId: 'SOME_USER_ID',
                        batchId: 'SOME_BATCH_ID',
                        courseId: 'SOME_BATCH_ID',
                        contentIds: [
                            'SOME_LEAF_NODE_1',
                            'SOME_LEAF_NODE_2'
                        ]
                    }));
                    done();
                });
            });
        });
    });
});
