import { CsAttachForumRequest, CsAttachForumResponse, CsRemoveForumRequest, CsRemoveForumResponse } from "@project-sunbird/client-services/services/discussion";
import { Container } from "inversify";
import { Observable } from "rxjs";
import { DiscussionService } from "../def/discussion-service";
import { CsCreateUserRequest, CsCreateUserResponse, CsGetForumIdsRequest, CsGetForumIdsResponse } from "@project-sunbird/client-services/services/discussion";
export declare class DiscussionServiceImpl implements DiscussionService {
    private container;
    constructor(container: Container);
    private readonly discussionServiceDelegate;
    getForumIds(request: CsGetForumIdsRequest): Observable<CsGetForumIdsResponse>;
    createUser(request: CsCreateUserRequest): Observable<CsCreateUserResponse>;
    attachForum(request: CsAttachForumRequest): Observable<CsAttachForumResponse>;
    removeForum(request: CsRemoveForumRequest): Observable<CsRemoveForumResponse>;
    createForum(request: any): Observable<CsAttachForumResponse>;
}
