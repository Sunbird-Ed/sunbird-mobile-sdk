import {DiscussionServiceImpl} from './discussion-service.impl';
import {Container} from 'inversify';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';

import {of} from 'rxjs';

describe('GroupServiceImpl', () => {
    let discussionServiceImpl: DiscussionServiceImpl;
    const mockContainer: Partial<Container> = {
        get: jest.fn()
    };
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        discussionServiceImpl = new DiscussionServiceImpl(
            mockContainer as Container,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of discussionServiceImpl', () => {
        expect(discussionServiceImpl).toBeTruthy();
    });

    it('should return GroupSuspendResponse by invoked suspendById', (done) => {
        // arrange
        const request = {
            id: 'sample-id'
        };
        mockContainer.get = jest.fn(() => ({
            getForumIds: jest.fn(() => of({}))
        })) as any;
        // act
        discussionServiceImpl.getForumIds(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return reactivateResponse by invoked reactivateById', (done) => {
        // arrange
        const request = {
            id: 'sample-id'
        };
        mockContainer.get = jest.fn(() => ({
            createUser: jest.fn(() => of({}))
        })) as any;
        // act
        discussionServiceImpl.createUser(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return attached forum id', (done) => {
        // arrange
        const request = {
            type: 'some_type',
            context: {
                type: 'some_type',
                identifier: 'some_id'
            }
        }
        mockContainer.get = jest.fn(() => ({
            attachForum: jest.fn(() => of({}))
        })) as any;
        // act
        discussionServiceImpl.attachForum(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should remove attached forum id', (done) => {
        // arrange
        const request = {
            sbType: 'some_type',
            sbIdentifier: 'id',
            cid: 1
        }
        mockContainer.get = jest.fn(() => ({
            removeForum: jest.fn(() => of({}))
        })) as any;
        // act
        discussionServiceImpl.removeForum(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return created forum id', (done) => {
        // arrange
        const request = {
            sbType: 'some_type',
            sbIdentifier: 'id',
            cid: 1
        }
        mockContainer.get = jest.fn(() => ({
            createForum: jest.fn(() => of({}))
        })) as any;
        // act
        discussionServiceImpl.createForum(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });
});
