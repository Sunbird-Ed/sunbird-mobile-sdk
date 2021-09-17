import { CsNotificationServiceConfig } from "@project-sunbird/client-services";
import { CsNotificationDeleteReq, CsNotificationReadResponse, CsNotificationUpdateReq } from "@project-sunbird/client-services/services/notification/interface/cs-notification-service";
import { Observable } from "rxjs";

export interface NotificationServiceV2 {
    notificationRead( uid: string, config?: CsNotificationServiceConfig): Observable<CsNotificationReadResponse>;
    notificationUpdate( req: CsNotificationUpdateReq, config?: CsNotificationServiceConfig): Observable<any>;
    notificationDelete( req: CsNotificationDeleteReq, config?: CsNotificationServiceConfig): Observable<any>;
};