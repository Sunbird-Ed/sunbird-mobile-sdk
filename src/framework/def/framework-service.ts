import { Framework } from './framework';
import { Channel } from './channel';
import {Observable} from 'rxjs';
import {
    ChannelDetailsRequest,
    FrameworkDetailsRequest,
} from './request-types';

export interface FrameworkService {

    getChannelDetails(request: ChannelDetailsRequest): Observable<Channel>;

    getFrameworkDetails(request: FrameworkDetailsRequest): Observable<Framework>;

    persistFrameworkDetails(request: Framework): Observable<boolean>;

}
