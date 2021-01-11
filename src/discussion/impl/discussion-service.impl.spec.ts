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
});
