import { AddManagedProfileRequest } from '../def/add-managed-profile-request';
import { Observable } from 'rxjs';
import { ProfileService, ProfileServiceConfig, ServerProfile } from '..';
import { ApiService } from '../../api';
import { AuthService } from '../../auth';
import { CachedItemStore } from '../../key-value-store';
import { GetManagedServerProfilesRequest } from '../def/get-managed-server-profiles-request';
import { DbService } from '../../db';
import { FrameworkService } from '../../framework';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class ManagedProfileManager {
    private profileService;
    private authService;
    private profileServiceConfig;
    private apiService;
    private cachedItemStore;
    private dbService;
    private frameworkService;
    private sharedPreferences;
    private static readonly MANGED_SERVER_PROFILES_LOCAL_KEY;
    private static readonly USER_PROFILE_DETAILS_KEY_PREFIX;
    private managedProfileAdded$;
    constructor(profileService: ProfileService, authService: AuthService, profileServiceConfig: ProfileServiceConfig, apiService: ApiService, cachedItemStore: CachedItemStore, dbService: DbService, frameworkService: FrameworkService, sharedPreferences: SharedPreferences);
    addManagedProfile(request: AddManagedProfileRequest): Observable<{
        uid: string;
    }>;
    getManagedServerProfiles(request: GetManagedServerProfilesRequest): Observable<ServerProfile[]>;
    switchSessionToManagedProfile({ uid }: {
        uid: string;
    }): Observable<undefined>;
    private persistManagedProfile;
    private createManagedProfile;
    private isLoggedInUser;
}
