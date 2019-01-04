import {Profile} from './profile';
import {Observable} from 'rxjs';

export interface ProfileService {
    createProfile(profile: Profile): Observable<Profile>;

    deleteProfile(uid: string): Observable<number>;
}
