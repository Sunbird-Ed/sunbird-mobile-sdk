import { NotificationService } from '../def/notification-service';
import { Observable } from 'rxjs';
import { Notification, NotificationFilterCriteria } from '../def/requests';
import { DbService } from '../../db';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class NotificationServiceImpl implements NotificationService {
    private dbService;
    private sharedPreferences;
    constructor(dbService: DbService, sharedPreferences: SharedPreferences);
    addNotification(notification: Notification): Observable<boolean>;
    deleteNotification(messageId?: number): Observable<boolean>;
    getAllNotifications(criteria: NotificationFilterCriteria): Observable<Notification[]>;
    updateNotification(notification: Notification): Observable<boolean>;
}
