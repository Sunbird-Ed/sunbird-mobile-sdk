import {AddManagedProfileRequest} from '../def/add-managed-profile-request';
import {defer, Observable, of, Subject} from 'rxjs';
import {
    NoActiveSessionError,
    NoProfileFoundError,
    Profile,
    ProfileService,
    ProfileServiceConfig,
    ProfileSession,
    ProfileSource,
    ProfileType,
    ServerProfile
} from '..';
import {ApiService, HttpRequestType, Request} from '../../api';
import {AuthService, OAuthSession, SessionProvider} from '../../auth';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';
import {GetManagedServerProfilesRequest} from '../def/get-managed-server-profiles-request';
import {mapTo, mergeMap, startWith, take, tap} from 'rxjs/operators';
import {ProfileEntry} from '../db/schema';
import {DbService} from '../../db';
import {ProfileDbEntryMapper} from '../util/profile-db-entry-mapper';
import {FrameworkService} from '../../framework';
import {ProfileKeys} from '../../preference-keys';
import {SharedPreferences} from '../../util/shared-preferences';
import {TelemetryLogger} from '../../telemetry/util/telemetry-logger';
import {ArrayUtil} from '../../util/array-util';

export class ManagedProfileManager {
    private static readonly MANGED_SERVER_PROFILES_LOCAL_KEY = 'managed_server_profiles-';
    private static readonly USER_PROFILE_DETAILS_KEY_PREFIX = 'userProfileDetails';
    private managedProfileAdded$ = new Subject<boolean>();

    constructor(
        private profileService: ProfileService,
        private authService: AuthService,
        private profileServiceConfig: ProfileServiceConfig,
        private apiService: ApiService,
        private cachedItemStore: CachedItemStore,
        private dbService: DbService,
        private frameworkService: FrameworkService,
        private sharedPreferences: SharedPreferences,
    ) {
    }

    addManagedProfile(request: AddManagedProfileRequest): Observable<{ uid: string }> {
        return defer(async () => {
            if (!(await this.isLoggedInUser())) {
                throw new NoActiveSessionError('No active LoggedIn Session found');
            }

            const { uid } = await this.createManagedProfile(request);

            setTimeout(() => {
                this.managedProfileAdded$.next(true);
            }, 1000);

            return { uid };
        });
    }

    getManagedServerProfiles(request: GetManagedServerProfilesRequest): Observable<ServerProfile[]> {
        return this.managedProfileAdded$.pipe(
            startWith(false),
            mergeMap((managedProfileAdded: boolean) => {
                return defer(async () => {
                    if (!(await this.isLoggedInUser())) {
                        throw new NoActiveSessionError('No active LoggedIn Session found');
                    }

                    if (request.from !== CachedItemRequestSourceFrom.SERVER) {
                        request.from = managedProfileAdded ? CachedItemRequestSourceFrom.SERVER : CachedItemRequestSourceFrom.CACHE;
                    }

                    const profile = await this.profileService.getActiveSessionProfile({requiredFields: []})
                        .toPromise();

                    const managedByUid: string = (profile.serverProfile && profile.serverProfile['managedBy']) ?
                        profile.serverProfile['managedBy'] :
                        profile.uid;

                    const fetchFromServer = () => {
                        return defer(async () => {
                            const managedByProfile: ServerProfile = (profile.serverProfile && !profile.serverProfile['managedBy']) ?
                                profile.serverProfile :
                                (
                                    await this.profileService.getServerProfilesDetails(
                                        {
                                            userId: profile.serverProfile!['managedBy'],
                                            requiredFields: request.requiredFields
                                        }
                                    ).toPromise()
                                );

                            const searchManagedProfilesRequest = new Request.Builder()
                                .withType(HttpRequestType.GET)
                                .withPath(`${this.profileServiceConfig.profileApiPath}/managed/${managedByUid}`)
                                .withParameters({
                                    'withTokens': 'true',
                                    'sortBy': 'createdDate',
                                    'order': 'desc'
                                })
                                .withBearerToken(true)
                                .withUserToken(true)
                                .build();

                            return await this.apiService
                                .fetch<{ result: { response: { content: ServerProfile[] } } }>(searchManagedProfilesRequest)
                                .toPromise()
                                .then((response) => {
                                    return [
                                        managedByProfile,
                                        ...response.body.result.response.content
                                            .sort((a, b) => new Date(b['createdDate']).getTime() - new Date(a['createdDate']).getTime())
                                    ];
                                });
                        }).pipe(
                            tap(async (managedProfiles: ServerProfile[]) => {
                                const persistedProfiles: Profile[] = await this.dbService.execute(`
                                    SELECT * from ${ProfileEntry.TABLE_NAME}
                                    WHERE ${ProfileEntry.COLUMN_NAME_UID}
                                    IN (${ArrayUtil.joinPreservingQuotes(managedProfiles.map(p => p.id))})
                                `).toPromise()
                                    .then((entries: any[]) =>
                                        entries.map(e => ProfileDbEntryMapper.mapProfileDBEntryToProfile(e))
                                    );

                                const nonPersistedProfiles = managedProfiles.filter((managedProfile) =>
                                    !persistedProfiles.find(p => p.uid === managedProfile.id)
                                );

                                for (const managedProfile of nonPersistedProfiles) {
                                    await this.persistManagedProfile(managedProfile);
                                }
                            })
                        );
                    };

                    return this.cachedItemStore[request.from === CachedItemRequestSourceFrom.SERVER ? 'get' : 'getCached'](
                        managedByUid,
                        ManagedProfileManager.MANGED_SERVER_PROFILES_LOCAL_KEY,
                        'ttl_' + ManagedProfileManager.MANGED_SERVER_PROFILES_LOCAL_KEY,
                        () => {return fetchFromServer()},
                    ).toPromise();
                });
            })
        );
    }

    switchSessionToManagedProfile({uid}: { uid: string }): Observable<undefined> {
        return defer(async () => {
            const profileSession = await this.profileService.getActiveProfileSession().toPromise();
            const initialSession = {...profileSession};
            await TelemetryLogger.log.end({
                type: 'session',
                env: 'sdk',
                mode: 'switch-user',
                duration: Math.floor((Date.now() - (initialSession.managedSession || initialSession).createdTime) / 1000),
                correlationData: [
                    {
                        type: 'InitiatorId',
                        id: initialSession.managedSession ? initialSession.managedSession.uid : initialSession.uid
                    },
                    {
                        type: 'ManagedUserId',
                        id: uid
                    },
                ]
            }).toPromise();

            const findProfile: () => Promise<Profile | undefined> = async () => {
                return this.dbService.read({
                    table: ProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [uid]
                }).toPromise().then((rows) =>
                    rows && rows[0] && ProfileDbEntryMapper.mapProfileDBEntryToProfile(rows[0])
                );
            };

            const profile = await findProfile();

            if (!profile) {
                throw new NoProfileFoundError(`No Profile found with uid=${uid}`);
            } else if (profile.source !== ProfileSource.SERVER) {
                throw new NoProfileFoundError(`No Server Profile found with uid=${uid}`);
            }

            if (profileSession.uid === uid) {
                profileSession.managedSession = undefined;
                const authSession = (await this.authService.getSession().toPromise())!;
                authSession.managed_access_token = undefined;
                await this.authService.setSession(new class implements SessionProvider {
                    async provide(): Promise<OAuthSession> {
                        return authSession;
                    }
                }).toPromise();
            } else {
                profileSession.managedSession = new ProfileSession(uid);

                const managedProfiles = await this.getManagedServerProfiles({
                    from: CachedItemRequestSourceFrom.CACHE,
                    requiredFields: []
                }).pipe(
                    take(1)
                ).toPromise();

                const managedProfile = managedProfiles.find((m) => m.id === uid)!;

                const authSession = (await this.authService.getSession().toPromise())!;
                authSession.managed_access_token = managedProfile['managedToken'];
                await this.authService.setSession(new class implements SessionProvider {
                    async provide(): Promise<OAuthSession> {
                        return authSession;
                    }
                }).toPromise();
            }

            await this.sharedPreferences.putString(
                ProfileKeys.KEY_USER_SESSION, JSON.stringify(profileSession)
            ).toPromise();

            await TelemetryLogger.log.start({
                type: 'session',
                env: 'sdk',
                mode: 'switch-user',
                correlationData: [
                    {
                        type: 'InitiatorId',
                        id: initialSession.managedSession ? initialSession.managedSession.uid : initialSession.uid
                    },
                    {
                        type: 'ManagedUserId',
                        id: profileSession.managedSession ? profileSession.managedSession.uid : profileSession.uid
                    },
                ]
            }).toPromise();
        }).pipe(
            mergeMap(() => {
                return this.authService.getSession().pipe(
                    mergeMap((session) => {
                        return this.authService.setSession(new class implements SessionProvider {
                            async provide(): Promise<OAuthSession> {
                                return {
                                    ...session!,
                                    userToken: uid
                                };
                            }
                        });
                    })
                );
            }),
            mergeMap(async () => {
                const serverProfile: ServerProfile = await this.profileService.getServerProfilesDetails({
                    userId: uid,
                    requiredFields: []
                }).toPromise();

                const rootOrgId = serverProfile.rootOrg ? serverProfile.rootOrg.hashTagId : serverProfile['rootOrgId'];

                return this.frameworkService.setActiveChannelId(rootOrgId).toPromise();

            }),
            mapTo(undefined)
        );
    }

    private async persistManagedProfile(serverProfile: ServerProfile) {
        // TODO: adding missing fields; should remove
        serverProfile.userId = serverProfile.id;
        serverProfile.rootOrg = {
            hashTagId: serverProfile['rootOrgId']
        };

        await this.profileService.createProfile({
            uid: serverProfile.id,
            profileType: ProfileType.STUDENT,
            source: ProfileSource.SERVER,
            handle: serverProfile.firstName,
            board: (serverProfile.framework && serverProfile.framework['board']) || [],
            medium: (serverProfile.framework && serverProfile.framework['medium']) || [],
            grade: (serverProfile.framework && serverProfile.framework['gradeLevel']) || [],
            gradeValue: (serverProfile.framework && serverProfile.framework['gradeValue']) || '',
            subject: (serverProfile.framework && serverProfile.framework['subject']) || [],
            serverProfile: serverProfile
        }, ProfileSource.SERVER).toPromise();

        await this.cachedItemStore.getCached(
            serverProfile.id,
            ManagedProfileManager.USER_PROFILE_DETAILS_KEY_PREFIX,
            ManagedProfileManager.USER_PROFILE_DETAILS_KEY_PREFIX,
            () => of(serverProfile)
        ).toPromise();
    }

    private async createManagedProfile(addManagedProfileRequest: AddManagedProfileRequest): Promise<{ uid: string }> {
        const currentProfile = await this.profileService.getActiveSessionProfile({requiredFields: []}).toPromise();

        if (currentProfile.source !== ProfileSource.SERVER) {
            throw new NoActiveSessionError('No active session available');
        }

        const createManagedProfileRequest = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.profileServiceConfig.profileApiPath_V2 + '/managed/create')
            .withBearerToken(true)
            .withUserToken(true)
            .withBody({
                request: addManagedProfileRequest
            })
            .build();

        return await this.apiService.fetch<{ result: { userId: string } }>(createManagedProfileRequest).toPromise()
            .then((response) => ({uid: response.body.result.userId}));
    }

    private async isLoggedInUser(): Promise<boolean> {
        return !!(await this.authService.getSession().toPromise());
    }
}
