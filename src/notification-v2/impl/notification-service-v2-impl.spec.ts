import {NotificationServiceV2Impl} from './notification-service-v2-impl';
import {Container} from 'inversify';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';

import {of} from 'rxjs';

describe('GroupServiceImpl', () => {
    let notificationServiceV2Impl: NotificationServiceV2Impl;
    const mockContainer: Partial<Container> = {
        get: jest.fn()
    };
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        notificationServiceV2Impl = new NotificationServiceV2Impl(
            mockContainer as Container,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of discussionServiceImpl', () => {
        expect(notificationServiceV2Impl).toBeTruthy();
    });

    it('should return notificationRead response when notificationRead invoked', (done) => {
        // arrange
        const request = 'sample-id'
        mockContainer.get = jest.fn(() => ({
            notificationRead: jest.fn(() => of({}))
        })) as any;
        // act
        notificationServiceV2Impl.notificationRead(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should return notificationUpdate response whnen notificationUpdate invoked', (done) => {
        // arrange
        const request = {
            ids: ['sample-id']
        } as any;
        mockContainer.get = jest.fn(() => ({
            notificationUpdate: jest.fn(() => of({}))
        })) as any;
        // act
        notificationServiceV2Impl.notificationUpdate(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

    it('should delete notification', (done) => {
        // arrange
        const request = {
            ids: ['sample-id']
        } as any;
        mockContainer.get = jest.fn(() => ({
            notificationDelete: jest.fn(() => of({}))
        })) as any;
        // act
        notificationServiceV2Impl.notificationDelete(request).subscribe(() => {
            expect(mockContainer.get).toHaveBeenCalled();
            done();
        });
    });

});
