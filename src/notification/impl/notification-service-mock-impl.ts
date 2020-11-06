import {NotificationFilterCriteria, NotificationService} from '..';
import {injectable} from 'inversify';
import {Observable, of} from 'rxjs';
import {Notification} from '..';

@injectable()
export class NotificationServiceMockImpl implements NotificationService {
    notifications$: Observable<Notification[]> = of([]);

    addNotification(notification: Notification): Observable<boolean> {
        return of(true);
    }

    deleteAllNotifications(): Observable<boolean> {
        return of(true);
    }

    deleteNotification(notification: Notification): Observable<boolean> {
        return of(true);
    }

    getAllNotifications(criteria: NotificationFilterCriteria): Observable<Notification[]> {
        return of([]);
    }

    onInit(): Observable<undefined> {
        return of(undefined);
    }

    updateNotification(notification: Notification): Observable<boolean> {
        return of(true);
    }
}
