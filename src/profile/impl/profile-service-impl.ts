import {
    AcceptTermsConditionRequest,
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
    ProfileSession,
    ProfileSource,
    ProfileType,
    ServerProfile,
    ServerProfileDetailsRequest,
    ServerProfileSearchCriteria,
    TenantInfoRequest,
    UpdateServerProfileInfoRequest,
    VerifyOtpRequest
} from '..';
import {DbService} from '../../db';
import {Observable} from 'rxjs';
import {GroupProfileEntry, ProfileEntry} from '../db/schema';
import {TenantInfo} from '../def/tenant-info';
import {TenantInfoHandler} from '../handler/tenant-info-handler';
import {ApiConfig, ApiService, HttpRequestType, Request, Response} from '../../api';
import {UpdateServerProfileInfoHandler} from '../handler/update-server-profile-info-handler';
import {SearchServerProfileHandler} from '../handler/search-server-profile-handler';
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
import {InjectionTokens} from '../../injection-tokens';
import {AuthService} from '../../auth';

@injectable()
export class ProfileServiceImpl implements ProfileService {
    private static readonly KEY_USER_SESSION = ProfileKeys.KEY_USER_SESSION;
    private static readonly MERGE_SERVER_PROFILES_PATH = '/api/user/v1/account/merge';

    private readonly apiConfig: ApiConfig;

    constructor(@inject(InjectionTokens.CONTAINER) private container: Container,
                @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
                @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
                @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
                @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore,
                @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore,
                @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
                @inject(InjectionTokens.FRAMEWORK_SERVICE) private frameworkService: FrameworkService,
                @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
                @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
                @inject(InjectionTokens.AUTH_SERVICE) private authService: AuthService) {
        this.apiConfig = this.sdkConfig.apiConfig;
    }

    private get telemetryService(): TelemetryService {
        return this.container.get<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE);
    }

    preInit(): Observable<undefined> {
        return this.sharedPreferences.getString(ProfileServiceImpl.KEY_USER_SESSION)
            .map((s) => s && JSON.parse(s))
            .mergeMap((profileSession?: ProfileSession) => {
                if (!profileSession) {
                    const request: Profile = {
                        uid: '',
                        handle: '',
                        profileType: ProfileType.TEACHER,
                        source: ProfileSource.LOCAL
                    };

                    return this.createProfile(request)
                        .mergeMap((profile: Profile) => {
                            return this.setActiveSessionForProfile(profile.uid);
                        })
                        .mapTo(undefined);
                }

                return this.setActiveSessionForProfile(profileSession.uid)
                    .mapTo(undefined);
            });
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
        }).do(async () => {
            await this.getActiveProfileSession()
                .map((session) => session.uid)
                .catch((e) => {
                    if (e instanceof NoActiveSessionError) {
                        return Observable.of(profile.uid);
                    }

                    return Observable.throw(e);
                })
                .mergeMap((uid) => {
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
                }).toPromise();
        }).mergeMap(() => Observable.of(profile));
    }

    deleteProfile(uid: string): Observable<undefined> {
        return this.dbService.read({
            table: ProfileEntry.TABLE_NAME,
            selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
            selectionArgs: [uid],
        }).map((rows) => {
            if (!rows || !rows[0]) {
                throw new NoProfileFoundError(`No Profile found with ID ${uid}`);
            }

            return ProfileDbEntryMapper.mapProfileDBEntryToProfile(rows[0]);
        }).do(async (profile: Profile) => {
            return await this.getActiveProfileSession()
                .mergeMap((session: ProfileSession) => {
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
                }).toPromise();
        }).mergeMap(() => {
            return this.dbService.delete({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [uid]
            });
        });
    }

    updateProfile(profile: Profile): Observable<Profile> {
        return this.dbService.read({
            table: ProfileEntry.TABLE_NAME,
            selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
            selectionArgs: [profile.uid],
        }).map((rows) => {
            if (!rows || !rows[0]) {
                throw new NoProfileFoundError(`No Profile found with ID ${profile.uid}`);
            }

            return ProfileDbEntryMapper.mapProfileDBEntryToProfile(rows[0]);
        }).do(async (prevProfile) => {
            await this.getActiveProfileSession()
                .mergeMap((session: ProfileSession) => {
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
                }).toPromise();
        }).mergeMap(() => {
            const profileDBEntry = ProfileDbEntryMapper.mapProfileToProfileDBEntry(profile);
            delete profileDBEntry[ProfileEntry.COLUMN_NAME_CREATED_AT];

            return this.dbService.update({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [profile.uid],
                modelJson: profileDBEntry
            }).mergeMap(() => Observable.of(profile));
        });
    }

    updateServerProfile(updateUserInfoRequest: UpdateServerProfileInfoRequest): Observable<Profile> {
        return new UpdateServerProfileInfoHandler(this.apiService,
            this.sdkConfig.profileServiceConfig).handle(updateUserInfoRequest);
    }

    getServerProfiles(searchCriteria: ServerProfileSearchCriteria): Observable<ServerProfile[]> {
        return new SearchServerProfileHandler(this.apiService, this.sdkConfig.profileServiceConfig).handle(searchCriteria);
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
            }).map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles));
        }

        if (!profileRequest.groupId) {
            return this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_SOURCE} = ?`,
                selectionArgs: [profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER],
                columns: []
            }).map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles));
        }

        if (profileRequest.groupId && (profileRequest.local || profileRequest.server)) {
            return this.dbService.execute(`
                SELECT * FROM ${ProfileEntry.TABLE_NAME} LEFT JOIN ${GroupProfileEntry.TABLE_NAME}
                ON ${ProfileEntry.TABLE_NAME}.${ProfileEntry.COLUMN_NAME_UID} =
                ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_UID}
                WHERE ${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}" AND
                ${ProfileEntry.COLUMN_NAME_SOURCE} = "${profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER}"
            `).map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles));
        }


        return this.dbService.execute(`
            SELECT * FROM ${ProfileEntry.TABLE_NAME}
            LEFT JOIN ${GroupProfileEntry.TABLE_NAME} ON
            ${ProfileEntry.TABLE_NAME}.${ProfileEntry.COLUMN_NAME_UID} =
            ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_UID}
            WHERE ${GroupProfileEntry.TABLE_NAME}.${GroupProfileEntry.COLUMN_NAME_GID} = "${profileRequest.groupId}"
        `).map((profiles: ProfileEntry.SchemaMap[]) => this.mapDbProfileEntriesToProfiles(profiles));
    }

    getServerProfilesDetails(serverProfileDetailsRequest: ServerProfileDetailsRequest): Observable<ServerProfile> {
        return new GetServerProfileDetailsHandler(this.apiService, this.sdkConfig.profileServiceConfig,
            this.cachedItemStore, this.keyValueStore)
            .handle(serverProfileDetailsRequest);
    }

    getActiveSessionProfile({requiredFields}: Pick<ServerProfileDetailsRequest, 'requiredFields'>): Observable<Profile> {
        return this.getActiveProfileSession()
            .mergeMap((profileSession: ProfileSession) => {
                return this.dbService.read({
                    table: ProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [profileSession.uid]
                }).map((rows) => {
                    const profileDBEntry = rows && rows[0];

                    if (!profileDBEntry) {
                        throw new NoProfileFoundError(`No profile found for profileSession with uid ${profileSession.uid}`);
                    }

                    return ProfileDbEntryMapper.mapProfileDBEntryToProfile(profileDBEntry);
                }).mergeMap((profile: Profile) => {
                    if (profile.source === ProfileSource.SERVER) {
                        return this.getServerProfilesDetails({
                            userId: profile.uid,
                            requiredFields
                        }).map((serverProfile: ServerProfile) => ({
                            ...profile,
                            handle: serverProfile.firstName + (serverProfile.lastName ? ' ' + serverProfile.lastName : ''),
                            serverProfile
                        }));
                    }

                    return Observable.of(profile);
                });
            });
    }

    setActiveSessionForProfile(profileUid: string): Observable<boolean> {
        return Observable.defer(() => this.generateSessionEndTelemetry())
            .mergeMap(() => {
                return this.dbService.read({
                    table: ProfileEntry.TABLE_NAME,
                    selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                    selectionArgs: [profileUid]
                });
            })
            .map((rows: ProfileEntry.SchemaMap[]) =>
                rows && rows[0] && ProfileDbEntryMapper.mapProfileDBEntryToProfile(rows[0])
            )
            .map((profile: Profile | undefined) => {
                if (!profile) {
                    throw new NoProfileFoundError('No Profile found');
                }
                return profile;
            })
            .mergeMap((profile: Profile) =>
                Observable.if(
                    () => profile.source === ProfileSource.SERVER,
                    Observable.defer(() => {
                        return this.getServerProfilesDetails({
                            userId: profile.uid,
                            requiredFields: []
                        }).map((serverProfile: ServerProfile) => ({
                            ...profile,
                            serverProfile
                        })).mergeMap((attachedServerProfileDetailsProfile: Profile) => {
                            return this.frameworkService
                                .setActiveChannelId(attachedServerProfileDetailsProfile.serverProfile!.rootOrg.hashTagId);
                        }).catch(() => Observable.of(undefined));
                    }),
                    this.frameworkService.setActiveChannelId(this.sdkConfig.apiConfig.api_authentication.channelId).mapTo(undefined)
                ).mapTo(profile)
            )
            .mergeMap((profile: Profile) => {
                const profileSession = new ProfileSession(profile.uid);
                return this.sharedPreferences.putString(ProfileServiceImpl.KEY_USER_SESSION, JSON.stringify({
                    uid: profileSession.uid,
                    sid: profileSession.sid,
                    createdTime: profileSession.createdTime
                })).mapTo(true);
            })
            .do(async () => await this.generateSessionStartTelemetry());
    }

    getActiveProfileSession(): Observable<ProfileSession> {
        return this.sharedPreferences.getString(ProfileServiceImpl.KEY_USER_SESSION)
            .map((response) => {
                if (response) {
                    return JSON.parse(response);
                }

                throw new NoActiveSessionError('No active session available');
            });
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
        return new SearchLocationHandler(this.apiService, this.sdkConfig.profileServiceConfig).handle(locationSearchCriteria);
    }

    getAllContentAccess(criteria: ContentAccessFilterCriteria): Observable<ContentAccess[]> {

        const query = `SELECT * FROM ${ContentAccessEntry.TABLE_NAME} ${ContentUtil.getUidnIdentifierFiler(
            criteria.uid, criteria.contentId)}`;

        return this.dbService.execute(query).map((contentAccessList: ContentAccessEntry.SchemaMap[]) => {
            return contentAccessList.map((contentAccess: ContentAccessEntry.SchemaMap) =>
                ProfileHandler.mapDBEntryToContenetAccess(contentAccess));
        });
    }

    addContentAccess(contentAccess: ContentAccess): Observable<boolean> {
        return this.getActiveProfileSession()
            .mergeMap(({uid}: ProfileSession) => {
                return this.dbService.read({
                    table: ContentAccessEntry.TABLE_NAME,
                    selection:
                        `${ContentAccessEntry.COLUMN_NAME_UID}= ? AND ${ContentAccessEntry
                            .COLUMN_NAME_CONTENT_IDENTIFIER}= ?`,
                    selectionArgs: [uid, contentAccess.contentId],
                    orderBy: `${ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP} DESC`,
                    limit: '1'
                }).mergeMap((contentAccessInDb: ContentAccessEntry.SchemaMap[]) => {
                    const contentAccessDbModel: ContentAccessEntry.SchemaMap = {
                        uid: uid,
                        identifier: contentAccess.contentId,
                        epoch_timestamp: Date.now(),
                        status: ContentAccessStatus.PLAYED.valueOf(),
                        content_type: contentAccess.contentType.toLowerCase(),
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
                        }).map(v => v > 0);
                    } else {
                        return this.dbService.insert({
                            table: ContentAccessEntry.TABLE_NAME,
                            modelJson: contentAccessDbModel
                        }).map(v => v > 0);
                    }
                });
            });


    }

    exportProfile(profileExportRequest: ProfileExportRequest): Observable<ProfileExportResponse> {
        const exportProfileContext: ExportProfileContext = {
            userIds: profileExportRequest.userIds,
            destinationFolder: profileExportRequest.destinationFolder,
            groupIds: profileExportRequest.groupIds!
        };

        return Observable.fromPromise(
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
        return Observable.fromPromise(
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
          .withApiToken(true)
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

        return this.apiService.fetch(apiRequest).map((res) => {
            console.log(res);
            return undefined;
        }).finally(() => {
            const launchUrl = this.sdkConfig.apiConfig.user_authentication.mergeUserHost +
                this.sdkConfig.apiConfig.user_authentication.authUrl + '/logout' + '?redirect_uri=' +
                this.sdkConfig.apiConfig.host + '/oauth2callback';

            const inAppBrowserRef = cordova.InAppBrowser.open(launchUrl, '_blank', 'zoom=no,hidden=yes');

            inAppBrowserRef.addEventListener('loadstart', async (event) => {
                if ((<string>event.url).indexOf('/oauth2callback') > -1) {
                    inAppBrowserRef.close();
                }
            });
        })
    }

    isDefaultChannelProfile(): Observable<boolean> {
        return Observable.zip(
            this.frameworkService.getDefaultChannelDetails(),
            this.frameworkService.getActiveChannelId()
        ).map((results) => {
            return results[0].identifier === results[1]
        });
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
}
