import { Notification, NotificationFilterCriteria, NotificationService } from '..';
import { DbService } from '../../db';
import { SharedPreferences } from '../../util/shared-preferences';
import { Observable, Subject } from 'rxjs';
import { ProfileService } from '../../profile';
import { SdkServiceOnInitDelegate } from '../../sdk-service-on-init-delegate';
import { KeyValueStore } from '../../key-value-store';
export declare class NotificationServiceImpl implements NotificationService, SdkServiceOnInitDelegate {
    private dbService;
    private sharedPreferences;
    private profileService;
    private keyValueStore;
    private static readonly USER_NOTIFICATION_FEED_KEY;
    constructor(dbService: DbService, sharedPreferences: SharedPreferences, profileService: ProfileService, keyValueStore: KeyValueStore);
    private _notifications$;
    private _notificationTrigger$;
    readonly notifications$: Subject<Notification[]>;
    onInit(): Observable<undefined>;
    addNotification(notification: Notification): Observable<boolean>;
    deleteNotification(notification: Notification): Observable<boolean>;
    getAllNotifications(criteria: NotificationFilterCriteria): Observable<Notification[]>;
    updateNotification(notification: Notification): Observable<boolean>;
    deleteAllNotifications(): Observable<boolean>;
    private fetchNotificationAndUserFeed;
    private triggerNotificationChange;
}
