import {Profile} from './profile';
import {Observable} from 'rxjs';
import {ServerProfileSearchCriteria} from './server-profile-search-criteria';
import {ServerProfile} from './server-profile';

export interface ProfileService {
    createProfile(profile: Profile): Observable<Profile>;

    deleteProfile(uid: string): Observable<number>;

    updateUserInfo(profile: Profile): Observable<Profile>;

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]>;
}

