import {Profile} from './profile';

export interface ProfileService {
    createProfile(profile: Profile): Promise<Profile>;

    deleteProfile(uid: string): Promise<number>;
}
