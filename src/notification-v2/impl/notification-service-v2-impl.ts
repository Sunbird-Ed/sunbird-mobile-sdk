import { CsAttachForumResponse } from "@project-sunbird/client-services/services/discussion";
import { Container, inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { CsInjectionTokens, InjectionTokens } from "../../injection-tokens";
import { CsCreateUserResponse } from "@project-sunbird/client-services/services/discussion";
import { CsNotificationDeleteReq, CsNotificationReadResponse, CsNotificationUpdateReq } from "@project-sunbird/client-services/services/notification/interface/cs-notification-service";
import { NotificationServiceV2 } from "../def/notification-service-v2";


@injectable()
export class NotificationServiceV2Impl implements NotificationServiceV2 {

    constructor(
        @inject(InjectionTokens.CONTAINER) private container: Container
    ) {
    }

    private get NotificationServiceV2Delegate(): NotificationServiceV2 {
        return this.container.get(CsInjectionTokens.NOTIFICATION_SERVICE_V2);
    }

    notificationRead(uid: string): Observable<CsNotificationReadResponse> {
        return this.NotificationServiceV2Delegate.notificationRead(uid);
    }

    notificationUpdate(request: CsNotificationUpdateReq): Observable<CsCreateUserResponse> {
        return this.NotificationServiceV2Delegate.notificationUpdate(request);
    }

    notificationDelete(request: CsNotificationDeleteReq): Observable<CsAttachForumResponse> {
        return this.NotificationServiceV2Delegate.notificationDelete(request);
    }

}
