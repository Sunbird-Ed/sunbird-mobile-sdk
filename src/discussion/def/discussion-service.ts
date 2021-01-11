import { CsCreateUserRequest, CsCreateUserResponse, CsGetForumIdsRequest, CsGetForumIdsResponse } from "@project-sunbird/client-services/services/discussion";
import { Observable } from "rxjs";

export interface DiscussionService {
    getForumIds(data: CsGetForumIdsRequest, config?): Observable<CsGetForumIdsResponse>;

    createUser(data: CsCreateUserRequest, config?): Observable<CsCreateUserResponse>
};