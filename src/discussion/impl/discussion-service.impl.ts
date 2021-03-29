import { CsAttachForumRequest, CsAttachForumResponse, CsDiscussionService, CsRemoveForumRequest, CsRemoveForumResponse } from "@project-sunbird/client-services/services/discussion";
import { Container, inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { CsInjectionTokens, InjectionTokens } from "../../injection-tokens";
import { DiscussionService } from "../def/discussion-service";
import { CsCreateUserRequest, CsCreateUserResponse, CsGetForumIdsRequest, CsGetForumIdsResponse } from "@project-sunbird/client-services/services/discussion";


@injectable()
export class DiscussionServiceImpl implements DiscussionService {


    constructor(
        @inject(InjectionTokens.CONTAINER) private container: Container
    ) {
    }

    private get discussionServiceDelegate(): CsDiscussionService {
        return this.container.get(CsInjectionTokens.DISCUSSION_SERVICE);
    }

    getForumIds(request: CsGetForumIdsRequest): Observable<CsGetForumIdsResponse> {
        return this.discussionServiceDelegate.getForumIds(request);
    }

    createUser(request: CsCreateUserRequest): Observable<CsCreateUserResponse> {
        return this.discussionServiceDelegate.createUser(request);
    }

    attachForum(request: CsAttachForumRequest): Observable<CsAttachForumResponse> {
        return this.discussionServiceDelegate.attachForum(request);
    }

    removeForum(request: CsRemoveForumRequest): Observable<CsRemoveForumResponse> {
        return this.discussionServiceDelegate.removeForum(request);
    }

    createForum(request): Observable<CsAttachForumResponse> {
        return this.discussionServiceDelegate.createForum(request);
    }

}
