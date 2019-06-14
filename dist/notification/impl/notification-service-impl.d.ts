import { NotificationService } from '../def/notification-service';
import { Observable } from 'rxjs';
import { Notification, NotificationFilterCriteria } from '../def/requests';
import { DbService } from '../../db';
export declare class NotificationServiceImpl implements NotificationService {
    private dbService;
    constructor(dbService: DbService);
    addNotification(notification: Notification): Observable<boolean>;
    deleteNotification(messageId?: number): Observable<boolean>;
    getAllNotifications(criteria: NotificationFilterCriteria): Observable<Notification[]>;
    updateNotification(notification: Notification): Observable<boolean>;
}
