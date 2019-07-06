import {Observable} from 'rxjs';
import {Notification, NotificationFilterCriteria} from './requests';

export interface NotificationService {
    addNotification(notifiation: Notification): Observable<boolean>;

    updateNotification(notifiation: Notification): Observable<boolean>;

    getAllNotifications(criteria: NotificationFilterCriteria): Observable<Notification[]>;

    deleteNotification(msgId?: number): Observable<boolean>;
}
