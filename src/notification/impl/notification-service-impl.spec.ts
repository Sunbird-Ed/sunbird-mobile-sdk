import { inject, injectable, Container } from 'inversify';
import { NotificationService } from '../def/notification-service';
import { of } from 'rxjs';
import { Notification, NotificationFilterCriteria, ActionData, NotificationStatus } from '../def/requests';
import { InjectionTokens } from '../../injection-tokens';
import { DbService } from '../../db';
import { NotificationEntry } from '../db/schema';
import { NotificationHandler } from '../handler/notification-handler';
import { SharedPreferences } from '../../util/shared-preferences';
import COLUMN_NAME_NOTIFICATION_JSON = NotificationEntry.COLUMN_NAME_NOTIFICATION_JSON;
import { CodePush } from '../../preference-keys';
import { NotificationServiceImpl } from './notification-service-impl';
import { instance, mock } from 'ts-mockito';
describe('NotificationServiceImpl', () => {

    let notificationServiceImpl: NotificationServiceImpl;
    const container = new Container();
    const mockDbService: Partial<DbService> = {};
    const mockSharedPreferences: SharedPreferences = instance(mock<SharedPreferences>());
    beforeAll(() => {
        container.bind<NotificationServiceImpl>(InjectionTokens.NOTIFICATION_SERVICE).to(NotificationServiceImpl);
        container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(container);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences);

        notificationServiceImpl = container.get(InjectionTokens.NOTIFICATION_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return an instance of notificationServiceImpl from container', () => {
        expect(notificationServiceImpl).toBeTruthy();
    });

    it('should call addNotification method successfully', () => {
        // arrange
        const sampleactionData: ActionData = {
            actionType: 'SAMPLE_ACTION_TYPE',
            title: 'SAMPLE_TITLE',
            identifier: 'SAMPLE_IDENTIFIER',
            ctaText: 'SAMPLE_CTA_TEXT',
            deepLink: 'SAMPLE_DEEPLINK',
            thumbnail: 'SAMPLE_THUMBNAIL',
            banner: 'SAMPLE_BANNER',
            deploymentKey: 'SAMPLE_DEPLOY_KEY'
        };
        const notification: Notification = {
            id: 1234,
            type: 12356,
            displayTime: 347889,
            expiry: 78989,
            isRead: 879000,
            actionData: sampleactionData
        };
        mockSharedPreferences.putString = jest.fn(() => of([]));
       // (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of(''));
        mockDbService.read = jest.fn(() => of([]));
        mockDbService.update = jest.fn(() => of([]));
        mockDbService.insert = jest.fn(() => of([]));
       // (mockDbService.read as jest.Mock).mockResolvedValue(of([]));

        // act
        notificationServiceImpl.addNotification(notification).subscribe(() => {
            expect(notification.actionData.deploymentKey).toBe('SAMPLE_DEPLOY_KEY');
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(CodePush.DEPLOYMENT_KEY, 'SAMPLE_DEPLOY_KEY');
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.update).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
        });
    });

    it('should call deleteNotification method on NotificationServiceImpl', () => {
        // arrange
        mockDbService.execute = jest.fn(() => of([]));

        // act
        notificationServiceImpl.deleteNotification().subscribe(() => {
            expect(mockDbService.execute).toHaveBeenCalled();
        });

    });
    it('should call getAllNotifications method on NotificationServiceImpl', () => {
        const notificationFilterCriteria:  NotificationFilterCriteria = {
            notificationStatus: NotificationStatus.ALL,
        };
        mockDbService.read = jest.fn(() => of([]));

        // act
        notificationServiceImpl.getAllNotifications(notificationFilterCriteria).subscribe(() => {
            expect(mockDbService.read).toHaveBeenCalled();
        });

    });
    it('should call getAllNotifications method on NotificationServiceImpl', () => {
        const notificationFilterCriteria:  NotificationFilterCriteria = {
            notificationStatus: NotificationStatus.UNREAD,
        };
        mockDbService.read = jest.fn(() => of([]));

        // act
        notificationServiceImpl.getAllNotifications(notificationFilterCriteria).subscribe(() => {
            expect(mockDbService.read).toHaveBeenCalled();
        });

    });
    it('should call getAllNotifications method on NotificationServiceImpl', () => {
        const notificationFilterCriteria:  NotificationFilterCriteria = {
            notificationStatus: NotificationStatus.READ,
        };
        mockDbService.read = jest.fn(() => of([]));

        // act
        notificationServiceImpl.getAllNotifications(notificationFilterCriteria).subscribe(() => {
            expect(mockDbService.read).toHaveBeenCalled();
        });

    });
    it('should call updateNotification method on NotificationServiceImpl', () => {
        // arrange
        const sampleactionData: ActionData = {
            actionType: 'SAMPLE_ACTION_TYPE',
            title: 'SAMPLE_TITLE',
            identifier: 'SAMPLE_IDENTIFIER',
            ctaText: 'SAMPLE_CTA_TEXT',
            deepLink: 'SAMPLE_DEEPLINK',
            thumbnail: 'SAMPLE_THUMBNAIL',
            banner: 'SAMPLE_BANNER',
            deploymentKey: 'SAMPLE_DEPLOY_KEY'
        };
        const notification: Notification = {
            id: 1234,
            type: 12356,
            displayTime: 347889,
            expiry: 78989,
            isRead: 879000,
            actionData: sampleactionData
        };
        mockDbService.read = jest.fn(() => of([]));
        mockDbService.update = jest.fn(() => of([]));

        // act
        notificationServiceImpl.updateNotification(notification).subscribe(() => {
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.update).toHaveBeenCalled();
        });

    });



});
