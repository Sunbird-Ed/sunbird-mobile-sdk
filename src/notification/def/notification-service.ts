import {Observable} from 'rxjs';
import {Notification, NotificationFilterCriteria} from './requests';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';

export interface NotificationService extends SdkServiceOnInitDelegate {
    notifications$: Observable<Notification[]>;

    addNotification(notification: Notification): Observable<boolean>;

    updateNotification(notification: Notification): Observable<boolean>;

    getAllNotifications(criteria: NotificationFilterCriteria): Observable<Notification[]>;

    deleteNotification(notification: Notification): Observable<boolean>;

    deleteAllNotifications(): Observable<boolean>;
}
