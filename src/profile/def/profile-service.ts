import {Profile} from './profile';
import {Observable} from 'rxjs';
import {UsersSearchCriteria} from './users-search-criteria';
import {User} from './user';

export interface ProfileService {
    createProfile(profile: Profile): Observable<Profile>;

    deleteProfile(uid: string): Observable<number>;

    updateUserInfo(profile: Profile): Observable<Profile>;

    getUsers(searchCriteria: UsersSearchCriteria): Observable<User[]>;
}

