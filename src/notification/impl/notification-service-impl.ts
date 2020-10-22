import {inject, injectable} from 'inversify';
import {ActionData, Notification, NotificationFilterCriteria, NotificationService, NotificationStatus, NotificationType} from '..';
import {InjectionTokens} from '../../injection-tokens';
import {DbService} from '../../db';
import {NotificationEntry} from '../db/schema';
import {NotificationHandler} from '../handler/notification-handler';
import {SharedPreferences} from '../../util/shared-preferences';
import {CodePush} from '../../preference-keys';
import {BehaviorSubject, combineLatest, defer, interval, Observable, of, Subject} from 'rxjs';
import {map, mapTo, mergeMap, startWith, switchMap, tap, throttleTime} from 'rxjs/operators';
import {ProfileService, UserFeedCategory, UserFeedEntry, UserFeedStatus} from '../../profile';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import COLUMN_NAME_NOTIFICATION_JSON = NotificationEntry.COLUMN_NAME_NOTIFICATION_JSON;

@injectable()
export class NotificationServiceImpl implements NotificationService, SdkServiceOnInitDelegate {
    constructor(
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
    ) {
    }

    private _notifications$ = new BehaviorSubject<Notification[]>([]);
    private _notificationTrigger$ = new Subject<null>();

    get notifications$(): Subject<Notification[]> {
        return this._notifications$;
    }

    onInit(): Observable<undefined> {
        const interval$ = interval(1000 * 10).pipe(
            startWith(null),
            mapTo(null),
        );

        const notificationTrigger$ = this._notificationTrigger$.pipe(
            startWith(null),
            throttleTime(1000),
        );

        return combineLatest([
            interval$,
            notificationTrigger$
        ]).pipe(
            switchMap(() => {
                return defer(async () => {
                    try {
                        const result = await this.fetchNotificationAndUserFeed();
                        this._notifications$.next(result);
                    } catch (e) {
                        console.error(e);
                    }
                });
            }),
            mapTo(undefined)
        );
    }

    addNotification(notification: Notification): Observable<boolean> {
        if (notification.actionData && notification.actionData.actionType === 'codePush' && notification.actionData.deploymentKey) {
            this.sharedPreferences.putString(CodePush.DEPLOYMENT_KEY, notification.actionData.deploymentKey);
        }
        return this.dbService.read({
            table: NotificationEntry.TABLE_NAME,
            selection: `${NotificationEntry.COLUMN_NAME_MESSAGE_ID}= ?`,
            selectionArgs: [notification.id.toString()],
            limit: '1'
        }).pipe(
            mergeMap((notificationInDb: NotificationEntry.SchemaMap[]) => {
                if (notificationInDb && notificationInDb.length) {
                    return this.dbService.update({
                        table: NotificationEntry.TABLE_NAME,
                        selection: `${NotificationEntry.COLUMN_NAME_MESSAGE_ID}= ?`,
                        selectionArgs: [notification.id.toString()],
                        modelJson: NotificationHandler.constructNotificationDBModel(notification)
                    }).pipe(
                        mapTo(true)
                    );
                } else {
                    return this.dbService.insert({
                        table: NotificationEntry.TABLE_NAME,
                        modelJson: NotificationHandler.constructNotificationDBModel(notification)
                    }).pipe(
                        mapTo(true)
                    );
                }
            }),
            tap(() => this.triggerNotificationChange())
        );
    }

    deleteNotification(notification: Notification): Observable<boolean> {
        if (notification.type === NotificationType.USER_FEED) {
            // todo
            return of(false);
        }

        const query = `DELETE FROM ${NotificationEntry.TABLE_NAME} `
            .concat(notification.id ? `WHERE ${NotificationEntry.COLUMN_NAME_MESSAGE_ID} = ${notification.id}` : '');
        return this.dbService.execute(query).pipe(
            mapTo(true),
            tap(() => this.triggerNotificationChange())
        );
    }

    getAllNotifications(criteria: NotificationFilterCriteria): Observable<Notification[]> {
        return this.dbService.read(NotificationHandler.getFilterForNotification(criteria)).pipe(
            map((notificationInDb: NotificationEntry.SchemaMap[]) => {
                return notificationInDb.map((notification) => {
                    const notificationRes: Notification = JSON.parse(notification[COLUMN_NAME_NOTIFICATION_JSON]!);
                    notificationRes.isRead = notification[NotificationEntry.COLUMN_NAME_IS_READ]!;
                    return notificationRes;
                });
            })
        );
    }

    updateNotification(notification: Notification): Observable<boolean> {
        if (notification.type === NotificationType.USER_FEED) {
            return this.profileService.updateUserFeedEntry({
                feedEntryId: notification.id as string,
                request: {
                    status: notification.isRead ? UserFeedStatus.READ : UserFeedStatus.UNREAD
                }
            }).pipe(
                tap(() => this.triggerNotificationChange())
            );
        }

        return this.dbService.read({
            table: NotificationEntry.TABLE_NAME,
            selection: `${NotificationEntry.COLUMN_NAME_MESSAGE_ID}= ?`,
            selectionArgs: [notification.id.toString()],
            limit: '1'
        }).pipe(
            mergeMap((notificationInDb: NotificationEntry.SchemaMap[]) => {
                if (notificationInDb && notificationInDb.length) {
                    return this.dbService.update({
                        table: NotificationEntry.TABLE_NAME,
                        selection: `${NotificationEntry.COLUMN_NAME_MESSAGE_ID}= ?`,
                        selectionArgs: [notification.id.toString()],
                        modelJson: NotificationHandler.constructNotificationDBModel(notification)
                    }).pipe(
                        mapTo(true)
                    );
                } else {
                    return of(false);
                }
            }),
            tap(() => this.triggerNotificationChange())
        );
    }

    private async fetchNotificationAndUserFeed(): Promise<Notification[]> {
        const fetchNotifications = async () => {
            return this.getAllNotifications({notificationStatus: NotificationStatus.ALL}).toPromise();
        };

        const fetchFeeds = async () => {
            try {
                await this.profileService.getActiveProfileSession().toPromise();
                return this.profileService.getUserFeed().toPromise().then((entries) => {
                    return entries.filter(e => e.category === UserFeedCategory.NOTIFICATION) as UserFeedEntry<ActionData>[];
                });
            } catch (e) {
                return [];
            }
        };

        const result = await Promise.all([
            fetchNotifications(),
            fetchFeeds()
        ]);

        const notifications = result[0];
        const userFeedEntries = result[1];

        return notifications.concat(
            userFeedEntries.map<Notification>((e) => {
                return {
                    id: e.identifier,
                    type: NotificationType.USER_FEED,
                    displayTime: new Date(e.createdOn).getTime(),
                    expiry: e.expireOn ? new Date(e.expireOn).getTime() : 0,
                    isRead: e.status === 'read' ? 1 : 0,
                    actionData: e.data
                };
            })
        ).sort((a, b) => {
            return new Date(b.displayTime).getTime() - new Date(a.displayTime).getTime();
        });
    }

    private async triggerNotificationChange() {
        this._notificationTrigger$.next(null);
    }
}
