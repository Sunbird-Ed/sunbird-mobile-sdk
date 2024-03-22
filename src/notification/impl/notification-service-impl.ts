import {inject, injectable} from 'inversify';
import {Notification, NotificationFilterCriteria, NotificationService, NotificationStatus} from '..';
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
import {KeyValueStore} from '../../key-value-store';
import {gzip} from 'pako/dist/pako_deflate';
import {ungzip} from 'pako/dist/pako_inflate';
import COLUMN_NAME_NOTIFICATION_JSON = NotificationEntry.COLUMN_NAME_NOTIFICATION_JSON;

@injectable()
export class NotificationServiceImpl implements NotificationService, SdkServiceOnInitDelegate {
    private static readonly USER_NOTIFICATION_FEED_KEY = 'user_notification_feed';

    constructor(
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore
    ) {
    }

    private _notifications$ = new BehaviorSubject<Notification[]>([]);
    private _notificationTrigger$ = new Subject<null>();

    get notifications$(): Subject<Notification[]> {
        return this._notifications$;
    }

    onInit(): Observable<undefined> {
        const interval$ = interval(1000 * 60 * 60).pipe(
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
                if (notificationInDb?.length) {
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
            tap(async () => await this.triggerNotificationChange())
        );
    }

    deleteNotification(notification: Notification): Observable<boolean> {
        if (notification.source === 'USER_FEED') {
            return this.profileService.deleteUserFeedEntry({
                feedEntryId: notification.id as string,
                category: UserFeedCategory.NOTIFICATION,
            }).pipe(
                tap(async () => await this.triggerNotificationChange())
            );
        }

        const query = `DELETE FROM ${NotificationEntry.TABLE_NAME} `
            .concat(notification.id ? `WHERE ${NotificationEntry.COLUMN_NAME_MESSAGE_ID} = ${notification.id}` : '');
        return this.dbService.execute(query).pipe(
            mapTo(true),
            tap(async () => await this.triggerNotificationChange())
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
        if (notification.source === 'USER_FEED') {
            return this.profileService.updateUserFeedEntry({
                feedEntryId: notification.id as string,
                category: UserFeedCategory.NOTIFICATION,
                request: {
                    status: notification.isRead ? UserFeedStatus.READ : UserFeedStatus.UNREAD
                }
            }).pipe(
                tap(async () => await this.triggerNotificationChange())
            );
        }

        return this.dbService.read({
            table: NotificationEntry.TABLE_NAME,
            selection: `${NotificationEntry.COLUMN_NAME_MESSAGE_ID}= ?`,
            selectionArgs: [notification.id.toString()],
            limit: '1'
        }).pipe(
            mergeMap((notificationInDb: NotificationEntry.SchemaMap[]) => {
                if (notificationInDb?.length) {
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
            tap(async () => await this.triggerNotificationChange())
        );
    }

    deleteAllNotifications(): Observable<boolean> {
        return defer(async () => {
            const notifications = this._notifications$.getValue();

            try {
                await Promise.all(notifications.map((n) => this.deleteNotification(n).toPromise()));
                return true;
            } catch (e) {
                console.error(e);
                return false;
            }
        });
    }

    private async fetchNotificationAndUserFeed(): Promise<Notification[]> {
        type PartialNotification = Exclude<Notification, 'id' | 'displayTime' | 'expiry' | 'isRead'>;
        const fetchNotifications = async () => {
            return this.getAllNotifications({notificationStatus: NotificationStatus.ALL}).toPromise();
        };

        const fetchFeeds = async () => {
            try {
                const session = await this.profileService.getActiveProfileSession().toPromise();
                const cacheKey = `${NotificationServiceImpl.USER_NOTIFICATION_FEED_KEY}_${session.managedSession ? session.managedSession.uid : session.uid}`;
                try {
                    const feed = await this.profileService.getUserFeed().toPromise().then((entries) => {
                        return entries.filter(e => e.category === UserFeedCategory.NOTIFICATION) as UserFeedEntry<PartialNotification>[];
                    });
                    await this.keyValueStore.setValue(
                        cacheKey,
                        gzip(JSON.stringify(feed))
                    ).toPromise();
                    return feed;
                } catch (e) {
                    return this.keyValueStore.getValue(
                        cacheKey
                    ).toPromise()
                        .then((r) => JSON.parse(ungzip(r, {to: 'string'})))
                        .catch((e) => {
                            console.error(e);
                            return [];
                        });
                }
            } catch (e) {
                return [];
            }
        };

        const result = await Promise.all([
            fetchNotifications(),
            fetchFeeds()
        ]);

        const notifications = result[0];
        const userFeedEntries: UserFeedEntry<PartialNotification>[] = result[1];

        return notifications.concat(
            userFeedEntries.map((e: any) => {
                return {
                    id: e['id'],
                    source: 'USER_FEED',
                    displayTime: new Date(e.createdOn).getTime(),
                    expiry: e.expireOn ? new Date(e.expireOn).getTime() : 0,
                    isRead: e.status === 'read' ? 1 : 0,
                    ...e.data
                } as Notification;
            })
        ).sort((a, b) => {
            return new Date(b.displayTime).getTime() - new Date(a.displayTime).getTime();
        });
    }

    private async triggerNotificationChange() {
        this._notificationTrigger$.next(null);
    }
}
