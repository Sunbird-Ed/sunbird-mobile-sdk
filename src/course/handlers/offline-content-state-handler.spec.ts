import {OfflineContentStateHandler} from './offline-content-state-handler';
import {GetContentStateRequest, KeyValueStore, UpdateContentStateRequest} from '../..';
import {of} from 'rxjs';

describe('OfflineContentStateHandler', () => {
    let offlineContentStateHandler: OfflineContentStateHandler;
    const mockKeyValueStore: Partial<KeyValueStore> = {};

    beforeAll(() => {
        offlineContentStateHandler = new OfflineContentStateHandler(
            mockKeyValueStore as KeyValueStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be created a instance of offlineContentStateHandler', () => {
        expect(offlineContentStateHandler).toBeTruthy();
    });

    it('should return local content staete response', (done) => {
        // arrange
        const request: GetContentStateRequest = {
            userId: 'uid-00001111',
            batchId: 'sample-batch-id',
            courseId: 'course-id-1',
            contentIds: []
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() => of('{"result": {"contentList": "sample-list"}}'));
        // act
        offlineContentStateHandler.getLocalContentStateResponse(request).subscribe((res) => {
            // assert
            expect(res.contentList).toEqual('sample-list');
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    it('should return local content staete response if result is undefind', (done) => {
        // arrange
        const request: GetContentStateRequest = {
            userId: 'uid-00001111',
            batchId: 'sample-batch-id',
            courseId: 'course-id-1',
            contentIds: []
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() => of('{"contentList": "sample-list"}'));
        // act
        offlineContentStateHandler.getLocalContentStateResponse(request).subscribe((res) => {
            // assert
            expect(res.contentList).toEqual('sample-list');
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    it('should return local content staete response if value is undefind', (done) => {
        // arrange
        const request: GetContentStateRequest = {
            userId: 'uid-00001111',
            batchId: 'sample-batch-id',
            courseId: 'course-id-1',
            contentIds: []
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() => of(undefined));
        // act
        offlineContentStateHandler.getLocalContentStateResponse(request).subscribe((res) => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked manipulateEnrolledCoursesResponseLocally() for multiple course', (done) => {
        // arrange
        const request: UpdateContentStateRequest = {
            userId: 'uid_0001',
            courseId: 'course_id',
            contentId: 'content_id',
            batchId: 'sample-batch-id',
            status: 2
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() =>
            of('{"result": {"courses": [{"courseId": "course_id", "batchId": "sample-batch-id"}]}}'));
        mockKeyValueStore.setValue = jest.fn().mockImplementation(() => of(true));
        // act
        offlineContentStateHandler.manipulateEnrolledCoursesResponseLocally(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            expect(mockKeyValueStore.setValue).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked manipulateEnrolledCoursesResponseLocally() for course is not available', (done) => {
        // arrange
        const request: UpdateContentStateRequest = {
            userId: 'uid_0001',
            courseId: 'course_id',
            contentId: 'content_id',
            batchId: 'sample-batch-id',
            status: 2
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() =>
            of('{"result": {"courses": []}}'));
        // act
        offlineContentStateHandler.manipulateEnrolledCoursesResponseLocally(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked manipulateEnrolledCoursesResponseLocally() for getvalue undefind', (done) => {
        // arrange
        const request: UpdateContentStateRequest = {
            userId: 'uid_0001',
            courseId: 'course_id',
            contentId: 'content_id',
            batchId: 'sample-batch-id',
            status: 2
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() =>
            of(undefined));
        // act
        offlineContentStateHandler.manipulateEnrolledCoursesResponseLocally(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked manipulateGetContentStateResponseLocally() if contentList empty', (done) => {
        // arrange
        const request: UpdateContentStateRequest = {
            userId: 'uid_0001',
            courseId: 'course_id',
            contentId: 'content_id',
            batchId: 'sample-batch-id',
            status: 2
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() => of('{"result": {"contentList": []}}'));
        // act
        offlineContentStateHandler.manipulateGetContentStateResponseLocally(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked manipulateGetContentStateResponseLocally() for multiple contents', (done) => {
        // arrange
        const request: UpdateContentStateRequest = {
            userId: 'uid_0001',
            courseId: 'course_id',
            contentId: 'content_id',
            batchId: 'sample-batch-id',
            status: 2
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() => of('{"result": {"contentList": [{"contentId": "content_id"}]}}'));
        // act
        offlineContentStateHandler.manipulateGetContentStateResponseLocally(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked manipulateGetContentStateResponseLocally() if contentList undefind', (done) => {
        // arrange
        const request: UpdateContentStateRequest = {
            userId: 'uid_0001',
            courseId: 'course_id',
            contentId: 'content_id',
            batchId: 'sample-batch-id',
            status: 2
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() => of('{"result": {}}'));
        // act
        offlineContentStateHandler.manipulateGetContentStateResponseLocally(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked manipulateGetContentStateResponseLocally() if getvalue undefind', (done) => {
        // arrange
        const request: UpdateContentStateRequest = {
            userId: 'uid_0001',
            courseId: 'course_id',
            contentId: 'content_id',
            batchId: 'sample-batch-id',
            status: 2
        };
        mockKeyValueStore.getValue = jest.fn().mockImplementation(() => of(undefined));
        // act
        offlineContentStateHandler.manipulateGetContentStateResponseLocally(request).subscribe(() => {
            // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    describe('getCourseCompletionPercentage', () => {
        it('should calculate percentage when progress will be zero', () => {
            // arrange
            const leafNodeCount = 2;
            const progress = 0;
            // act
            offlineContentStateHandler.getCourseCompletionPercentage(leafNodeCount, progress);
            // assert
            expect((leafNodeCount / progress) * 100).toBe(Infinity);
        });

        it('should calculate percentage when completionData is greter than 100', () => {
            // arrange
            const leafNodeCount = 2;
            const progress = 1;
            // act
            offlineContentStateHandler.getCourseCompletionPercentage(leafNodeCount, progress);
            // assert

        });

        it('should calculate percentage for course completion', () => {
            // arrange
            const leafNodeCount = 2;
            const progress = 2;
            // act
            offlineContentStateHandler.getCourseCompletionPercentage(leafNodeCount, progress);
        });
    });
});
