import { CsDiscussionServiceConfig } from "@project-sunbird/client-services";
import { CsAttachForumRequest, CsAttachForumResponse, CsCreateUserRequest, CsCreateUserResponse, CsGetForumIdsRequest, CsGetForumIdsResponse, CsRemoveForumRequest, CsRemoveForumResponse } from "@project-sunbird/client-services/services/discussion";
import { Observable } from "rxjs";
export interface DiscussionService {
    getForumIds(data: CsGetForumIdsRequest, config?: CsDiscussionServiceConfig): Observable<CsGetForumIdsResponse>;
    createUser(data: CsCreateUserRequest, config?: CsDiscussionServiceConfig): Observable<CsCreateUserResponse>;
    attachForum(data: CsAttachForumRequest): Observable<CsAttachForumResponse>;
    removeForum(data: CsRemoveForumRequest, config?: CsDiscussionServiceConfig): Observable<CsRemoveForumResponse>;
    createForum(data: any, config?: CsDiscussionServiceConfig): Observable<CsAttachForumResponse>;
}
