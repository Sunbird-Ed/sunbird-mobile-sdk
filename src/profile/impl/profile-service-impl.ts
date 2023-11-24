import {
    AcceptTermsConditionRequest,
    Consent,
    ContentAccess,
    ContentAccessStatus,
    GenerateOtpRequest,
    GetAllProfileRequest,
    IsProfileAlreadyInUseRequest,
    LocationSearchCriteria,
    MergeServerProfilesRequest,
    NoActiveSessionError,
    NoProfileFoundError,
    Profile,
    ProfileExportRequest,
    ProfileExportResponse,
    ProfileService,
    ProfileServiceConfig,
    ProfileSession,
    ProfileSource,
    ProfileType,
    ReadConsentResponse,
    ServerProfile,
    ServerProfileDetailsRequest,
    TenantInfoRequest,
    UpdateConsentResponse,
    UserFeedEntry,
    UserMigrateRequest,
    VerifyOtpRequest
} from '..';
import {DbService} from '../../db';
import {GroupProfileEntry, ProfileEntry} from '../db/schema';
import {TenantInfo} from '../def/tenant-info';
import {TenantInfoHandler} from '../handler/tenant-info-handler';
import {ApiConfig, ApiService, HttpRequestType, Request, Response} from '../../api';
import {GetServerProfileDetailsHandler} from '../handler/get-server-profile-details-handler';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {ProfileDbEntryMapper} from '../util/profile-db-entry-mapper';
import {ContentAccessFilterCriteria} from '../def/content-access-filter-criteria';
import {AcceptTermConditionHandler} from '../handler/accept-term-condition-handler';
import {ProfileHandler} from '../handler/profile-handler';
import {ContentAccessEntry} from '../../content/db/schema';
import {InvalidProfileError} from '../errors/invalid-profile-error';
import {UniqueId} from '../../db/util/unique-id';
import {ProfileExistsResponse} from '../def/profile-exists-response';
import {IsProfileAlreadyInUseHandler} from '../handler/is-profile-already-in-use-handler';
import {GenerateOtpHandler} from '../handler/generate-otp-handler';
import {VerifyOtpHandler} from '../handler/verify-otp-handler';
import {LocationSearchResult} from '../def/location-search-result';
import {SearchLocationHandler} from '../handler/search-location-handler';
import {SharedPreferences} from '../../util/shared-preferences';
import {FrameworkService} from '../../framework';
import {ContentUtil} from '../../content/util/content-util';
import {ProfileKeys} from '../../preference-keys';
import {TelemetryLogger} from '../../telemetry/util/telemetry-logger';
import {ProfileImportRequest} from '../def/profile-import-request';
import {ProfileImportResponse} from '../def/profile-import-response';
import {ExportProfileContext} from '../def/export-profile-context';
import {GetEparFilePath} from '../handler/export/get-epar-file-path';
import {FileService} from '../../util/file/def/file-service';
import {CopyDatabase} from '../handler/export/copy-database';
import {CreateMetaData} from '../handler/export/create-metadata';
import {DeviceInfo} from '../../util/device';
import {CleanupExportedFile} from '../handler/export/clean-up-exported-file';
import {GenerateProfileImportTelemetry} from '../handler/import/generate-profile-import-telemetry';
import {GenerateProfileExportTelemetry} from '../handler/export/generate-profile-export-telemetry';
import {ImportProfileContext} from '../def/import-profile-context';
import {ValidateProfileMetadata} from '../handler/import/validate-profile-metadata';
import {TransportUser} from '../handler/import/transport-user';
import {TransportGroup} from '../handler/import/transport-group';
import {TransportGroupProfile} from '../handler/import/transport-group-profile';
import {TransportFrameworkNChannel} from '../handler/import/transport-framework-n-channel';
import {TransportAssesments} from '../handler/import/transport-assesments';
import {UpdateImportedProfileMetadata} from '../handler/import/update-imported-profile-metadata';
import {Actor, AuditState, ObjectType, TelemetryAuditRequest, TelemetryService} from '../../telemetry';
import {ObjectUtil} from '../../util/object-util';
import {TransportProfiles} from '../handler/import/transport-profiles';
import {SdkConfig} from '../../sdk-config';
import {Container, inject, injectable} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {AuthService} from '../../auth';
import {defer, from, iif, Observable, of, throwError, zip} from 'rxjs';
import {catchError, finalize, map, mapTo, mergeMap, tap} from 'rxjs/operators';
import {UserMigrateResponse} from '../def/user-migrate-response';
import {UserMigrateHandler} from '../handler/user-migrate-handler';
import {ManagedProfileManager} from '../handler/managed-profile-manager';
import {CsUserService} from '@project-sunbird/client-services/services/user';
import {CheckUserExistsRequest} from '../def/check-user-exists-request';
import {CheckUserExistsResponse} from '../def/check-user-exists-response';
import {UpdateServerProfileDeclarationsResponse} from '../def/update-server-profile-declarations-response';
import {UpdateServerProfileDeclarationsRequest} from '../def/update-server-profile-declarations-request';
import {CsModule} from '@project-sunbird/client-services';
import {UpdateUserFeedRequest} from '../def/update-user-feed-request';
import {DeleteUserFeedRequest} from '../def/delete-user-feed-request';
import {UpdateServerProfileResponse} from '../def/update-server-profile-response';
import {UpdateServerProfileInfoRequest} from '../def/update-server-profile-info-request';
import {DeleteProfileDataHandler} from '../handler/delete-profile-data.handler';

@injectable()
export class ProfileServiceImpl implements ProfileService {
    private static readonly KEY_USER_SESSION = ProfileKeys.KEY_USER_SESSION;
    private static readonly MERGE_SERVER_PROFILES_PATH = '/api/user/v1/account/merge';

    private readonly apiConfig: ApiConfig;
    private readonly profileServiceConfig: ProfileServiceConfig;
    readonly managedProfileManager: ManagedProfileManager;

    constructor(
        @inject(InjectionTokens.CONTAINER) private container: Container,
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore,
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.FRAMEWORK_SERVICE) private frameworkService: FrameworkService,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.AUTH_SERVICE) private authService: AuthService,
        @inject(CsInjectionTokens.USER_SERVICE) private userService: CsUserService
    ) {
        this.apiConfig = this.sdkConfig.apiConfig;
        this.profileServiceConfig = this.sdkConfig.profileServiceConfig;
        this.managedProfileManager = new ManagedProfileManager(
            this,
            this.authService,
            this.sdkConfig.profileServiceConfig,
            this.apiService,
            this.cachedItemStore,
            this.dbService,
            this.frameworkService,
            this.sharedPreferences
        );
    }

    private get telemetryService(): TelemetryService {
        return this.container.get<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE);
    }

    preInit(): Observable<undefined> {
        return this.sharedPreferences.getString(ProfileServiceImpl.KEY_USER_SESSION).pipe(
            map((s) => s && JSON.parse(s)),
            mergeMap((profileSession?: ProfileSession) => {
                if (!profileSession) {
                    const request: Profile = {
                        uid: '',
                        handle: '',
                        profileType: ProfileType.TEACHER,
                        source: ProfileSource.LOCAL
                    };

                    return this.createProfile(request)
                        .pipe(
                            mergeMap((profile: Profile) => {
                                return this.setActiveSessionForProfile(profile.uid);
                            }),
                            mapTo(undefined)
                        );
                }

                return profileSession.managedSession ?
                    this.managedProfileManager.switchSessionToManagedProfile({
                        uid: profileSession.managedSession.uid
                    }) : this.setActiveSessionForProfile(
                        profileSession.uid
                    ).pipe(
                        mapTo(undefined)
                    );
            })
        );
    }

    checkServerProfileExists(request: CheckUserExistsRequest): Observable<CheckUserExistsResponse> {
        return this.userService.checkUserExists(
            request.matching, request.captchaResponseToken ? {token: request.captchaResponseToken, app: '1'} : undefined
        );
    }

    createProfile(profile: Profile, profileSource: ProfileSource = ProfileSource.LOCAL): Observable<Profile> {
        switch (profileSource) {
            case ProfileSource.LOCAL: {
                if (profile.source !== ProfileSource.LOCAL) {
                    throw new InvalidProfileError(`Invalid value supplied for field 'source': ${profile.source}`);
                } else if (profile.serverProfile) {
                    throw new InvalidProfileError(`Invalid value supplied for field 'serverProfile': ${profile.serverProfile}`);
                }

                profile.uid = UniqueId.generateUniqueId();

                break;
            }

            case ProfileSource.SERVER: {
                if (profile.source !== ProfileSource.SERVER) {
                    throw new InvalidProfileError(`Invalid value supplied for field 'source': ${profile.source}`);
                } else if (!profile.serverProfile) {
                    throw new InvalidProfileError(`Invalid value supplied for field 'serverProfile': ${profile.serverProfile}`);
                } else if (!profile.uid) {
                    throw new InvalidProfileError(`Invalid value supplied for field 'uid': ${profile.uid}`);
                }

                break;
            }
        }

        profile.createdAt = Date.now();

        return this.dbService.insert({
            table: ProfileEntry.TABLE_NAME,
            modelJson: ProfileDbEntryMapper.mapProfileToProfileDBEntry(profile)
        }).pipe(
            tap(async () => {
                await this.getActiveProfileSession()
                    .pipe(
                        map((session) => session.uid),
                        catchError((e) => {
                            if (e instanceof NoActiveSessionError) {
                                return of(profile.uid);
                            }

                            return throwError(e);
                        }),
                        mergeMap((uid) => {
                            const actor = new Actor();
                            actor.id = uid;
                            actor.type = Actor.TYPE_SYSTEM;

                            const auditRequest: TelemetryAuditRequest = {
                                env: 'sdk',
                                actor,
                                currentState: AuditState.AUDIT_CREATED,
                                updatedProperties: ObjectUtil.getTruthyProps(profile),
                                objId: profile.uid,
                                objType: ObjectType.USER,
                                correlationData: [{
                                    id: profile.profileType,
                                    type: 'UserRole'
                                }]
                            };

                            return this.telemetryService.audit(auditRequest);
                        })
                    )
                    .toPromise();
            }),
            mergeMap(() => of(profile))
        );
    }

    deleteProfile(uid: string): Observable<undefined> {
        return this.dbService.read({
            table: ProfileEntry.TABLE_NAME,
            selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
            selectionArgs: [uid],
        }).pipe(
            map((rows) => {
                if (!rows || !rows[0]) {
                    throw new NoProfileFoundError(`No Profile found with ID ${uid}`);
                }

                return ProfileDbEntryMapper.mapProfileDBEntryToProfile(rows[0]);
            }),
            tap(async (profile: Profile) => {
                return await this.getActiveProfileSession()
                    .pipe(
                        mergeMap((session: ProfileSession) => {
                            const actor = new Actor();
                            actor.id = session.uid;
                            actor.type = Actor.TYPE_SYSTEM;

                            const auditRequest: TelemetryAuditRequest = {
                                env: 'sdk',
                                actor,
                                currentState: AuditState.AUDIT_DELETED,
                                objId: uid,
                                objType: ObjectType.USER,
                                correlationData: [{
                                    id: profile.profileType,
                                    type: 'UserRole'
                                }]
                            };

                            return this.telemetryService.audit(auditRequest);
                        })
                    )
                    .toPromise();
            }),
            mergeMap(() => {
                return this.dbService.delete({
                    table: ProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [uid]
                });
            })
        );
    }

    updateProfile(profile: Profile): Observable<Profile> {
        return this.dbService.read({
            table: ProfileEntry.TABLE_NAME,
            selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
            selectionArgs: [profile.uid],
        }).pipe(
            map((rows) => {
                if (!rows || !rows[0]) {
                    throw new NoProfileFoundError(`No Profile found with ID ${profile.uid}`);
                }

                return ProfileDbEntryMapper.mapProfileDBEntryToProfile(rows[0]);
            }),
            tap(async (prevProfile) => {
                await this.getActiveProfileSession().pipe(
                    mergeMap((session: ProfileSession) => {
                        const actor = new Actor();
                        actor.id = session.uid;
                        actor.type = Actor.TYPE_SYSTEM;

                        const auditRequest: TelemetryAuditRequest = {
                            env: 'sdk',
                            actor,
                            currentState: AuditState.AUDIT_UPDATED,
                            updatedProperties: ObjectUtil.getPropDiff(profile, prevProfile),
                            objId: profile.uid,
                            objType: ObjectType.USER,
                            correlationData: [{
                                id: profile.profileType,
                                type: 'UserRole'
                            }]
                        };

                        return this.telemetryService.audit(auditRequest);
                    })
                ).toPromise();
            }),
            mergeMap(() => {
                const profileDBEntry: any = ProfileDbEntryMapper.mapProfileToProfileDBEntry(profile);
                delete profileDBEntry[ProfileEntry.COLUMN_NAME_CREATED_AT];

                return this.dbService.update({
                    table: ProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [profile.uid],
                    modelJson: profileDBEntry
                }).pipe(
                    mergeMap(() => of(profile))
                );
            })
        );
    }

    updateServerProfile(updateUserInfoRequest: UpdateServerProfileInfoRequest): Observable<UpdateServerProfileResponse> {
        return this.userService.updateProfile(updateUserInfoRequest, { apiPath : '/api/user/v3'});
    }

    getTenantInfo(tenantInfoRequest: TenantInfoRequest): Observable<TenantInfo> {
        return new TenantInfoHandler(this.apiService,
            this.sdkConfig.profileServiceConfig).handle(tenantInfoRequest);
    }

    getAllProfiles(profileRequest?: GetAllProfileRequest): Observable<Profile[]> {
        if (!profileRequest) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                columns: []
            }).pipe(
                map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles))
            );
        }

        if (!profileRequest.groupId) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_SOURCE} = ?`,
                selectionArgs: [profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER],
                columns: []
            }).pipe(
                map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles))
            );
        }

        if (profileRequest.groupId && (profileRequest.local || profileRequest.server)) {
            return this.dbService.execute(`
                SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME}
                ON ${ProfileEntry.TABLE_NAME}.${ProfileEntry.COLUMN_NAME_UID} =
                ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_UID}
                WHERE ${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}" AND
                ${ProfileEntry.COLUMN_NAME_SOURCE} = "${profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER}"
            `).pipe(
                map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles))
            );
        }


        return this.dbService.execute(`
            SELECT * FROM ${ProfileEntry.TABLE_NAME}
            LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${ProfileEntry.TABLE_NAME}.${ProfileEntry.COLUMN_NAME_UID} =
            ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_UID}
            WHERE ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}"
        `).pipe(
            map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles))
        );
    }

    getServerProfilesDetails(serverProfileDetailsRequest: ServerProfileDetailsRequest): Observable<ServerProfile> {
        return new GetServerProfileDetailsHandler(this.cachedItemStore, this.keyValueStore, this.container, this.profileServiceConfig)
          .handle(serverProfileDetailsRequest);
    }

    getActiveSessionProfile({requiredFields}: Pick<ServerProfileDetailsRequest, 'requiredFields'>): Observable<Profile> {
        return this.getActiveProfileSession().pipe(
            mergeMap((profileSession: ProfileSession) => {
                return this.dbService.read({
                    table: ProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [profileSession.managedSession ? profileSession.managedSession.uid : profileSession.uid]
                }).pipe(
                    map((rows) => {
                        const profileDBEntry = rows && rows[0];

                        if (!profileDBEntry) {
                            throw new NoProfileFoundError(`No profile found for profileSession with uid ${profileSession.managedSession ? profileSession.managedSession.uid : profileSession.uid}`);
                        }

                        return ProfileDbEntryMapper.mapProfileDBEntryToProfile(profileDBEntry);
                    }),
                    mergeMap((profile: Profile) => {
                        if (profile.source === ProfileSource.SERVER) {
                            return this.getServerProfilesDetails({
                                userId: profile.uid,
                                requiredFields
                            }).pipe(
                                map((serverProfile: ServerProfile) => ({
                                    ...profile,
                                    handle: serverProfile.firstName + (serverProfile.lastName ? ' ' + serverProfile.lastName : ''),
                                    serverProfile
                                }))
                            );
                        }

                        return of(profile);
                    })
                );
            })
        );
    }

    setActiveSessionForProfile(profileUid: string): Observable<boolean> {
        return defer(() => this.generateSessionEndTelemetry()).pipe(
            mergeMap(() => {
                return this.dbService.read({
                    table: ProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [profileUid]
                });
            }),
            map((rows: ProfileEntry.SchemaMap[]) =>
                rows && rows[0] && ProfileDbEntryMapper.mapProfileDBEntryToProfile(rows[0])
            ),
            map((profile: Profile | undefined) => {
                if (!profile) {
                    throw new NoProfileFoundError('No Profile found');
                }
                return profile;
            }),
            mergeMap((profile: Profile) =>
                iif(
                    () => profile.source === ProfileSource.SERVER,
                    defer(() => {
                        return this.getServerProfilesDetails({
                            userId: profile.uid,
                            requiredFields: []
                        }).pipe(
                            map((serverProfile: ServerProfile) => ({
                                ...profile,
                                serverProfile
                            })),
                            mergeMap((attachedServerProfileDetailsProfile: Profile) => {
                                return this.frameworkService
                                    .setActiveChannelId(attachedServerProfileDetailsProfile.serverProfile!.rootOrg.hashTagId);
                            }),
                            catchError(() => of(undefined))
                        );
                    }),
                    this.frameworkService.setActiveChannelId(this.sdkConfig.apiConfig.api_authentication.channelId).pipe(
                        mapTo(undefined)
                    )
                ).pipe(
                    mapTo(profile)
                )
            ),
            mergeMap((profile: Profile) => {
                const profileSession = new ProfileSession(profile.uid);
                if (CsModule.instance.isInitialised) {
                    CsModule.instance.updateConfig({
                        ...CsModule.instance.config,
                        core: {
                            ...CsModule.instance.config.core,
                            global: {
                                ...CsModule.instance.config.core.global,
                                sessionId: profileSession.sid
                            }
                        }
                    });
                }
                return this.sharedPreferences.putString(
                    ProfileServiceImpl.KEY_USER_SESSION, JSON.stringify(profileSession)
                ).pipe(
                    mapTo(true)
                );
            }),
            tap(async () => await this.generateSessionStartTelemetry())
        );
    }

    getActiveProfileSession(): Observable<ProfileSession> {
        return this.sharedPreferences.getString(ProfileServiceImpl.KEY_USER_SESSION).pipe(
            map((response) => {
                if (response) {
                    return JSON.parse(response);
                }

                throw new NoActiveSessionError('No active session available');
            })
        );
    }

    acceptTermsAndConditions(acceptTermsConditions: AcceptTermsConditionRequest): Observable<boolean> {
        return new AcceptTermConditionHandler(this.apiService, this.sdkConfig.profileServiceConfig).handle(acceptTermsConditions);
    }

    isProfileAlreadyInUse(isProfileAlreadyInUseRequest: IsProfileAlreadyInUseRequest): Observable<ProfileExistsResponse> {
        return new IsProfileAlreadyInUseHandler(this.apiService, this.sdkConfig.profileServiceConfig).handle(isProfileAlreadyInUseRequest);
    }

    generateOTP(generateOtpRequest: GenerateOtpRequest): Observable<boolean> {
        return new GenerateOtpHandler(this.apiService, this.sdkConfig.profileServiceConfig).handle(generateOtpRequest);
    }

    verifyOTP(verifyOTPRequest: VerifyOtpRequest): Observable<boolean> {
        return new VerifyOtpHandler(this.apiService, this.sdkConfig.profileServiceConfig).handle(verifyOTPRequest);
    }

    searchLocation(locationSearchCriteria: LocationSearchCriteria): Observable<LocationSearchResult[]> {
        return new SearchLocationHandler(this.apiService, this.sdkConfig.profileServiceConfig, this.fileService, this.cachedItemStore)
            .handle(locationSearchCriteria);
    }

    getAllContentAccess(criteria: ContentAccessFilterCriteria): Observable<ContentAccess[]> {

        const query = `SELECT * FROM ${ContentAccessEntry.TABLE_NAME} ${ContentUtil.getUidnIdentifierFiler(
            criteria.uid, criteria.contentId)}`;

        return this.dbService.execute(query).pipe(
            map((contentAccessList: ContentAccessEntry.SchemaMap[]) => {
                return contentAccessList.map((contentAccess: ContentAccessEntry.SchemaMap) =>
                    ProfileHandler.mapDBEntryToContenetAccess(contentAccess));
            })
        );
    }

    addContentAccess(contentAccess: ContentAccess): Observable<boolean> {
        return this.getActiveProfileSession().pipe(
            mergeMap(({uid}: ProfileSession) => {
                return this.dbService.read({
                    table: ContentAccessEntry.TABLE_NAME,
                    selection:
                        `${ContentAccessEntry.COLUMN_NAME_UID}= ? AND ${ContentAccessEntry
                            .COLUMN_NAME_CONTENT_IDENTIFIER}= ?`,
                    selectionArgs: [uid, contentAccess.contentId],
                    orderBy: `${ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP} DESC`,
                    limit: '1'
                }).pipe(
                    mergeMap((contentAccessInDb: ContentAccessEntry.SchemaMap[]) => {
                        const contentAccessDbModel: ContentAccessEntry.SchemaMap = {
                            uid: uid,
                            identifier: contentAccess.contentId,
                            epoch_timestamp: Date.now(),
                            status: ContentAccessStatus.PLAYED.valueOf(),
                            content_type: contentAccess.contentType && contentAccess.contentType.toLowerCase(),
                            learner_state: contentAccess.contentLearnerState! &&
                                JSON.stringify(contentAccess.contentLearnerState!.learnerState)
                        };
                        if (contentAccessInDb && contentAccessInDb.length) {
                            contentAccessDbModel.status = contentAccessInDb[0][ContentAccessEntry.COLUMN_NAME_STATUS];
                            return this.dbService.update({
                                table: ContentAccessEntry.TABLE_NAME,
                                selection:
                                    `${ContentAccessEntry.COLUMN_NAME_UID}= ? AND ${ContentAccessEntry
                                        .COLUMN_NAME_CONTENT_IDENTIFIER}= ?`,
                                selectionArgs: [uid, contentAccess.contentId],
                                modelJson: contentAccessDbModel
                            }).pipe(
                                map(v => v > 0)
                            );
                        } else {
                            return this.dbService.insert({
                                table: ContentAccessEntry.TABLE_NAME,
                                modelJson: contentAccessDbModel
                            }).pipe(
                                map(v => v > 0)
                            );
                        }
                    })
                );
            })
        );
    }

    exportProfile(profileExportRequest: ProfileExportRequest): Observable<ProfileExportResponse> {
        const exportProfileContext: ExportProfileContext = {
            userIds: profileExportRequest.userIds,
            destinationFolder: profileExportRequest.destinationFolder,
            groupIds: profileExportRequest.groupIds!
        };

        return from(
            new GetEparFilePath(this.fileService).execute(exportProfileContext).then((exportResponse: Response) => {
                return new CopyDatabase(this.dbService).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                const response: ProfileExportResponse = {exportedFilePath: ''};
                return new CreateMetaData(this.dbService, this.fileService, this.deviceInfo).execute(exportResponse.body);
            }).then((exportResponse: Response) => {
                const response: ProfileExportResponse = {exportedFilePath: ''};
                return new CleanupExportedFile(this.dbService, this.fileService).execute(exportResponse.body)
                    .catch(() => exportResponse);
            }).then((exportResponse: Response) => {
                return new GenerateProfileExportTelemetry(this.dbService).execute(exportResponse.body);
            }).then((exportResponse: Response<ExportProfileContext>) => {
                return {exportedFilePath: exportResponse.body.destinationDBFilePath!};
            }));
    }

    importProfile(profileImportRequest: ProfileImportRequest): Observable<ProfileImportResponse> {
        const importProfileContext: ImportProfileContext = {
            sourceDBFilePath: profileImportRequest.sourceFilePath,

        };
        return from(
            new ValidateProfileMetadata(this.dbService).execute(importProfileContext).then((importResponse: Response) => {
                return new TransportUser(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new TransportProfiles(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new TransportGroup(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new TransportGroupProfile(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new TransportFrameworkNChannel(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new TransportAssesments(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new UpdateImportedProfileMetadata(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response) => {
                return new GenerateProfileImportTelemetry(this.dbService).execute(importResponse.body);
            }).then((importResponse: Response<ImportProfileContext>) => {
                return {failed: importResponse.body.failed!, imported: importResponse.body.imported!};
            }));
    }

    mergeServerProfiles(mergeServerProfilesRequest: MergeServerProfilesRequest): Observable<undefined> {
        const apiRequest = new Request.Builder()
            .withType(HttpRequestType.PATCH)
            .withPath(ProfileServiceImpl.MERGE_SERVER_PROFILES_PATH)
            .withBearerToken(true)
            .withHeaders({
                'x-source-user-token': mergeServerProfilesRequest.from.accessToken,
                'x-authenticated-user-token': mergeServerProfilesRequest.to.accessToken
            })
            .withBody({
                request: {
                    fromAccountId: mergeServerProfilesRequest.from.userId,
                    toAccountId: mergeServerProfilesRequest.to.userId
                }
            })
            .build();

        return this.apiService.fetch(apiRequest).pipe(
            map((res) => {
                console.log(res);
                return undefined;
            }),
            finalize(() => {
                const launchUrl = this.sdkConfig.apiConfig.user_authentication.mergeUserHost +
                    this.sdkConfig.apiConfig.user_authentication.authUrl + '/logout' + '?redirect_uri=' +
                    this.sdkConfig.apiConfig.host + '/oauth2callback';

                const inAppBrowserRef = cordova.InAppBrowser.open(launchUrl, '_blank', 'zoom=no,hidden=yes');

                inAppBrowserRef.addEventListener('loadstart', async (event) => {
                    if ((<string> event.url).indexOf('/oauth2callback') > -1) {
                        inAppBrowserRef.close();
                    }
                });
            })
        );
    }

    isDefaultChannelProfile(): Observable<boolean> {
        return zip(
            this.frameworkService.getDefaultChannelId(),
            this.frameworkService.getActiveChannelId()
        ).pipe(
            map((results) => {
                return results[0] === results[1];
            })
        );
    }

    getUserFeed(): Observable<UserFeedEntry[]> {
        return this.getActiveProfileSession().pipe(
            mergeMap((session) => {
                return this.userService.getUserFeed(session.managedSession ? session.managedSession.uid : session.uid, {
                    apiPath: this.sdkConfig.profileServiceConfig.profileApiPath_V5
                });
            })
        );
    }

    updateUserFeedEntry(updateUserFeedRequest: UpdateUserFeedRequest): Observable<boolean> {
        return this.getActiveProfileSession().pipe(
            mergeMap((session) => {
                return this.userService.updateUserFeedEntry(
                    session.managedSession ? session.managedSession.uid : session.uid,
                    updateUserFeedRequest.feedEntryId,
                    updateUserFeedRequest.category,
                    updateUserFeedRequest.request,
                    {
                        apiPath: this.sdkConfig.profileServiceConfig.profileApiPath_V5
                    }
                ).pipe(
                    mapTo(true),
                    catchError(() => of(false))
                );
            })
        );
    }

    deleteUserFeedEntry(deleteUserFeedRequest: DeleteUserFeedRequest): Observable<boolean> {
        return this.getActiveProfileSession().pipe(
            mergeMap((session) => {
                return this.userService.deleteUserFeedEntry(
                    session.managedSession ? session.managedSession.uid : session.uid,
                    deleteUserFeedRequest.feedEntryId,
                    deleteUserFeedRequest.category,
                    {
                        apiPath: this.sdkConfig.profileServiceConfig.profileApiPath
                    }
                ).pipe(
                    mapTo(true),
                    catchError(() => of(false))
                );
            })
        );
    }

    userMigrate(userMigrateRequest: UserMigrateRequest): Observable<UserMigrateResponse> {
        return new UserMigrateHandler(this.sdkConfig, this.apiService)
            .handle(userMigrateRequest);
    }

    updateServerProfileDeclarations(request: UpdateServerProfileDeclarationsRequest): Observable<UpdateServerProfileDeclarationsResponse> {
        return this.userService.updateUserDeclarations(request.declarations,
            {apiPath : this.sdkConfig.profileServiceConfig.profileApiPath});
    }

    getConsent(userConsent: Consent): Observable<ReadConsentResponse> {
        return this.userService.getConsent(userConsent, { apiPath : this.sdkConfig.profileServiceConfig.profileApiPath});
    }

    updateConsent(userConsent: Consent): Observable<UpdateConsentResponse> {
        return this.userService.updateConsent(userConsent, { apiPath : this.sdkConfig.profileServiceConfig.profileApiPath});
    }

    private mapDbProfileEntriesToProfiles(profiles: ProfileEntry.SchemaMap[]): Profile[] {
        return profiles.map((profile: ProfileEntry.SchemaMap) => ProfileDbEntryMapper.mapProfileDBEntryToProfile(profile));
    }

    private async generateSessionStartTelemetry() {
        return TelemetryLogger.log.start({
            type: 'session', env: 'sdk'
        }).toPromise();
    }

    private async generateSessionEndTelemetry() {
        const sessionString = await this.sharedPreferences.getString(ProfileServiceImpl.KEY_USER_SESSION).toPromise();

        if (sessionString) {
            const profileSession = JSON.parse(sessionString);

            await TelemetryLogger.log.end({
                type: 'session',
                env: 'sdk',
                duration: Math.floor((Date.now() - profileSession.createdTime) / 1000)
            }).toPromise();
        }
    }

    deleteProfileData(uid: string): Observable<boolean> {
        return new DeleteProfileDataHandler(this.dbService).delete(uid);
    }
}

