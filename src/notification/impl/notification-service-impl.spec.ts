import {Container} from 'inversify';
import {of} from 'rxjs';
import {ActionData, Notification, NotificationFilterCriteria, NotificationStatus, NotificationType} from '../def/requests';
import {InjectionTokens} from '../../injection-tokens';
import {DbService} from '../../db';
import {NotificationEntry} from '../db/schema';
import {SharedPreferences} from '../../util/shared-preferences';
import {CodePush} from '../../preference-keys';
import {NotificationServiceImpl} from './notification-service-impl';
import {instance, mock} from 'ts-mockito';
import {KeyValueStore} from '../../key-value-store';
import {ProfileService} from '../../profile';

describe('NotificationServiceImpl', () => {

    let notificationServiceImpl: NotificationServiceImpl;
    const container = new Container();
    const mockDbService: Partial<DbService> = {};
    const mockSharedPreferences: SharedPreferences = instance(mock<SharedPreferences>());
    const mockKeyValueStore: KeyValueStore = instance(mock<KeyValueStore>());
    const mockProfileService: ProfileService = instance(mock<ProfileService>());
    beforeAll(() => {
        container.bind<NotificationServiceImpl>(InjectionTokens.NOTIFICATION_SERVICE).to(NotificationServiceImpl);
        container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(container);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences);
        container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).toConstantValue(mockKeyValueStore);
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(mockProfileService);

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
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => of([]));
       // (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of(''));
        mockDbService.read = jest.fn().mockImplementation(() => of([]));
        mockDbService.update = jest.fn().mockImplementation(() => of([]));
        mockDbService.insert = jest.fn().mockImplementation(() => of([]));
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
        const fcmNotification: Notification = {
            id: 0,
            type: NotificationType.ACTIONABLE_NOTIFICATION,
            displayTime: Date.now(),
            expiry: Date.now(),
            isRead: 0,
            actionData: {} as any
        };
        mockDbService.execute = jest.fn().mockImplementation(() => of([]));

        // act
        notificationServiceImpl.deleteNotification(fcmNotification).subscribe(() => {
            expect(mockDbService.execute).toHaveBeenCalled();
        });

    });
    it('should call getAllNotifications method on NotificationServiceImpl', () => {
        const notificationFilterCriteria:  NotificationFilterCriteria = {
            notificationStatus: NotificationStatus.ALL,
        };
        mockDbService.read = jest.fn().mockImplementation(() => of([]));

        // act
        notificationServiceImpl.getAllNotifications(notificationFilterCriteria).subscribe(() => {
            expect(mockDbService.read).toHaveBeenCalled();
        });

    });
    it('should call getAllNotifications method on NotificationServiceImpl', () => {
        const notificationFilterCriteria:  NotificationFilterCriteria = {
            notificationStatus: NotificationStatus.UNREAD,
        };
        mockDbService.read = jest.fn().mockImplementation(() => of([]));

        // act
        notificationServiceImpl.getAllNotifications(notificationFilterCriteria).subscribe(() => {
            expect(mockDbService.read).toHaveBeenCalled();
        });

    });
    it('should call getAllNotifications method on NotificationServiceImpl', () => {
        const notificationFilterCriteria:  NotificationFilterCriteria = {
            notificationStatus: NotificationStatus.READ,
        };
        mockDbService.read = jest.fn().mockImplementation(() => of([]));

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
        mockDbService.read = jest.fn().mockImplementation(() => of([]));
        mockDbService.update = jest.fn().mockImplementation(() => of([]));

        // act
        notificationServiceImpl.updateNotification(notification).subscribe(() => {
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.update).toHaveBeenCalled();
        });

    });



});
