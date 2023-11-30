import {
    AcceptTermsConditionRequest,
    ContentAccess,
    ContentAccessStatus,
    ContentLearnerState,
    GenerateOtpRequest,
    GetAllProfileRequest,
    IsProfileAlreadyInUseRequest,
    LocationSearchCriteria,
    MergeServerProfilesRequest,
    NoActiveSessionError,
    NoProfileFoundError,
    Profile,
    ProfileExportRequest,
    ProfileService,
    ProfileServiceConfig,
    ProfileServiceImpl,
    ProfileSession,
    ProfileSource,
    ProfileType,
    ServerProfile,
    ServerProfileDetailsRequest,
    TenantInfoRequest,
    UpdateServerProfileInfoRequest,
    UserMigrateRequest,
    VerifyOtpRequest
} from '..';
import {Container} from 'inversify';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {TelemetryAuditRequest, TelemetryService} from '../../telemetry';
import {SdkConfig} from '../../sdk-config';
import {DbService} from '../../db';
import {ApiService, Response} from '../../api';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {Channel, FrameworkService} from '../../framework';
import {FileService} from '../../util/file/def/file-service';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {Observable, of} from 'rxjs';
import {ProfileEntry} from '../db/schema';
import {AuthService} from '../../auth';
import {TenantInfo} from '../def/tenant-info';
import {TenantInfoHandler} from '../handler/tenant-info-handler';
import {GetServerProfileDetailsHandler} from '../handler/get-server-profile-details-handler';
import {AcceptTermConditionHandler} from '../handler/accept-term-condition-handler';
import {ProfileExistsResponse} from '../def/profile-exists-response';
import {IsProfileAlreadyInUseHandler} from '../handler/is-profile-already-in-use-handler';
import {GenerateOtpHandler} from '../handler/generate-otp-handler';
import {VerifyOtpHandler} from '../handler/verify-otp-handler';
import {SearchLocationHandler} from '../handler/search-location-handler';
import {LocationSearchResult} from '../def/location-search-result';
import {ContentAccessFilterCriteria} from '../def/content-access-filter-criteria';
import {ContentUtil} from '../../content/util/content-util';
import {ProfileImportRequest} from '../def/profile-import-request';
import {ValidateProfileMetadata} from '../handler/import/validate-profile-metadata';
import {TransportProfiles} from '../handler/import/transport-profiles';
import {TransportGroup} from '../handler/import/transport-group';
import {UpdateImportedProfileMetadata} from '../handler/import/update-imported-profile-metadata';
import {UserMigrateHandler} from '../handler/user-migrate-handler';
import {CsUserService} from '@project-sunbird/client-services/services/user';
import {CsModule} from '@project-sunbird/client-services';
import { UniqueId } from '../../db/util/unique-id';
import { DeleteProfileDataHandler } from '../handler/delete-profile-data.handler';

jest.mock('../handler/tenant-info-handler');
jest.mock('../handler/get-server-profile-details-handler');
jest.mock('../handler/accept-term-condition-handler');
jest.mock('../handler/is-profile-already-in-use-handler');
jest.mock('../handler/generate-otp-handler');
jest.mock('../handler/verify-otp-handler');
jest.mock('../handler/search-location-handler');
jest.mock('../handler/import/validate-profile-metadata');
jest.mock('../handler/import/transport-profiles');
jest.mock('../handler/import/transport-group');
jest.mock('../handler/import/update-imported-profile-metadata');
jest.mock('../handler/user-migrate-handler');

jest.mock('../../telemetry/util/telemetry-logger',
    () => ({
        'TelemetryLogger': class {
            public static get log() {
                return {
                    start: jest.fn().mockImplementation(() => of(undefined)),
                    end: jest.fn().mockImplementation(() => of(undefined)),
                    share: jest.fn().mockImplementation(() => of(undefined))
                };
            }
        }
    })
);

describe.only('ProfileServiceImpl', () => {
    let profileService: ProfileService;

    const container = new Container();
    const mockSdkConfig: Partial<SdkConfig> = {
        profileServiceConfig: {
            profileApiPath: 'MOCK_V1_API_PATH'
        } as Partial<ProfileServiceConfig> as ProfileServiceConfig
    };
    const mockDbService: Partial<DbService> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {
        audit(request: TelemetryAuditRequest): Observable<boolean> {
            return of(true);
        }
    };
    const mockCsUserService: Partial<CsUserService> = {};
    jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')

    beforeAll(() => {
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).to(ProfileServiceImpl);
        container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(container);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig as SdkConfig);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).toConstantValue(mockCachedItemStore as CachedItemStore);
        container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).toConstantValue(mockKeyValueStore as KeyValueStore);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);
        container.bind<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE).toConstantValue(mockFrameworkService as FrameworkService);
        container.bind<FileService>(InjectionTokens.FILE_SERVICE).toConstantValue(mockFileService as FileService);
        container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).toConstantValue(mockDeviceInfo as DeviceInfo);
        container.bind<AuthService>(InjectionTokens.AUTH_SERVICE).toConstantValue(mockAuthService as AuthService);
        container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).toConstantValue(mockTelemetryService as TelemetryService);
        container.bind<CsUserService>(CsInjectionTokens.USER_SERVICE).toConstantValue(mockCsUserService as CsUserService);

        profileService = container.get(InjectionTokens.PROFILE_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('should return an instance of ProfileServiceImpl from container', () => {
        expect(profileService).toBeTruthy();
    });

    describe('preInit()', () => {
        it('should create new Session for existing Profile on preInit()', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => {
                const profileSession = new ProfileSession('SAMPLE_UID');
                return of(JSON.stringify({
                    uid: profileSession.uid,
                    sid: profileSession.sid,
                    createdTime: profileSession.createdTime
                }));
            });
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            spyOn(profileService, 'createProfile').and.stub();
            spyOn(profileService, 'setActiveSessionForProfile').and.returnValue(of(true));

            profileService.preInit().subscribe(() => {
                // assert
                expect(profileService.createProfile).not.toBeCalled();
                expect(profileService.setActiveSessionForProfile).toBeCalledWith('SAMPLE_UID');
                done();
            });
        });

        it('should create new Profile and Session if no Profile exists on preInit()', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(undefined));
            spyOn(profileService, 'createProfile').and.returnValue(of({
                uid: 'SAMPLE_UID'
            }) as Partial<ProfileSession>);
            spyOn(profileService, 'setActiveSessionForProfile').and.returnValue(of(true));

            // act
            profileService.preInit().subscribe(() => {
                // assert
                expect(profileService.createProfile).toBeCalled();
                expect(profileService.setActiveSessionForProfile).toBeCalledWith('SAMPLE_UID');
                done();
            });
        });

        it('should set  active channelid on preInit() if manage session is available', (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => of([{
                [ProfileEntry.COLUMN_NAME_UID]: 'SAMPLE_UID',
                [ProfileEntry.COLUMN_NAME_HANDLE]: 'SAMPLE_HANDLE',
                [ProfileEntry.COLUMN_NAME_PROFILE_TYPE]: ProfileType.STUDENT,
                [ProfileEntry.COLUMN_NAME_SOURCE]: ProfileSource.SERVER,
            } as ProfileEntry.SchemaMap]));
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => {
                const profileSession = new ProfileSession('SAMPLE_UID');
                return of(JSON.stringify({
                    uid: profileSession.uid,
                    sid: profileSession.sid,
                    createdTime: profileSession.createdTime,
                    managedSession: profileSession
                }));
            });
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            mockSharedPreferences.putString = jest.fn().mockImplementation(() => {
                return of(undefined);
            });
            mockAuthService.getSession = jest.fn().mockImplementation(() => of({
                access_token: 'sample-access-token',
                refresh_token: 'sample-refresh-token',
                userToken: 'sample-user-token'
            }));

            mockAuthService.setSession = jest.fn().mockImplementation(() => of({
            }));
            spyOn(profileService, 'createProfile').and.stub();
            spyOn(profileService, 'setActiveSessionForProfile').and.returnValue(of(true));
            spyOn(profileService, 'getServerProfilesDetails').and.returnValue(of({rootOrgId: 'sample_rootorg_id'}));
            mockFrameworkService.setActiveChannelId = jest.fn().mockImplementation(() => of({
            }));
            // act
            profileService.preInit().subscribe(() => {
                // assert
                expect(profileService.createProfile).not.toBeCalled();
                expect(mockFrameworkService.setActiveChannelId).toBeCalledWith('sample_rootorg_id');
                done();
            });
        });
    });

    describe('checkUserExists()', () => {
        it('should delegate to CsUserService.checkUserExists()', (done) => {
            // arrange
            mockCsUserService.checkUserExists = jest.fn(() => of({exists: true}));

            const request = {
                matching: {key: 'userId', value: 'SOME_USER_ID'},
                captchaResponseToken: 'SOME_CAPTCHA_TOKEN'
            };

            profileService.checkServerProfileExists(request).subscribe(() => {
                expect(mockCsUserService.checkUserExists).toHaveBeenCalledWith(
                    request.matching, expect.objectContaining({token: request.captchaResponseToken, app: '1'})
                );
                done();
            });
        });

        it('should invoke to CsUserService.checkUserExists() with undefined', (done) => {
            // arrange
            mockCsUserService.checkUserExists = jest.fn(() => of({exists: true}));

            const request = {
                matching: {key: 'userId', value: 'SOME_USER_ID'},
                captchaResponseToken: undefined
            };

            profileService.checkServerProfileExists(request).subscribe(() => {
                expect(mockCsUserService.checkUserExists).toHaveBeenCalledWith(
                  request.matching, undefined
                );
                done();
            });
        });
    });

    describe('createProfile()', () => {
        it('should create a profile saved in db on createProfile()', (done) => {
            // arrange
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            const profile: Profile = {
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.LOCAL
            };
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            profileService.createProfile(profile, ProfileSource.LOCAL).subscribe((createdProfile) => {
                // assert
                expect(profile === createdProfile).toBeTruthy();
                expect(mockDbService.insert).toHaveBeenCalledWith(
                    expect.objectContaining({
                        table: ProfileEntry.TABLE_NAME
                    })
                );
                done();
            });
        });

        it('should create a server profile saved in db only if serverProfile field is set on createProfile()', (done) => {
            // arrange
            mockTelemetryService.audit = jest.fn().mockImplementation(() => of(true));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            const profile: Profile = {
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.SERVER,
                // serverProfile: {} as Partial<ServerProfile> as ServerProfile
            };

            // act
            // assert
            expect(() => profileService.createProfile(profile, ProfileSource.SERVER))
                .toThrow();

            done();
        });

        it('should throw error if source is LOCAL,  profile.source is not LOCAL', (done) => {
            // arrange
            mockTelemetryService.audit = jest.fn().mockImplementation(() => of(true));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            const profile: Profile = {
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.SERVER,
                serverProfile: {}
            } as any;

            // act
            // assert
            expect(() => profileService.createProfile(profile, ProfileSource.LOCAL))
              .toThrow();

            done();
        });

        it('should throw error if source is LOCAL ,profile.source is not LOCAL and  have no serverProfile', (done) => {
            // arrange
            mockTelemetryService.audit = jest.fn().mockImplementation(() => of(true));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            const profile: Profile = {
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.LOCAL,
                serverProfile: {}
            } as any;

            // act
            // assert
            expect(() => profileService.createProfile(profile, ProfileSource.LOCAL))
              .toThrow();

            done();
        });

        it('should throw error if source is SERVER,  profile.source is not SERVER', (done) => {
            // arrange
            mockTelemetryService.audit = jest.fn().mockImplementation(() => of(true));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            const profile: Profile = {
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.LOCAL,
                serverProfile: {}
            } as any;

            // act
            // assert
            expect(() => profileService.createProfile(profile, ProfileSource.SERVER))
              .toThrow();

            done();
        });

        it('should not throw error if source is LOCAL ,profile.source is not LOCAL and  have no serverProfile', (done) => {
            // arrange
            mockTelemetryService.audit = jest.fn().mockImplementation(() => of(true));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            const profile: Profile = {
                uid: '',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.SERVER,
                serverProfile: {}
            } as any;

            // act
            // assert
            expect(() => profileService.createProfile(profile, ProfileSource.SERVER)).toThrow();

            done();
        });

        it('should not throw error if source is LOCAL ,profile.source is not LOCAL and  have no serverProfile', (done) => {
            // arrange
            mockTelemetryService.audit = jest.fn().mockImplementation(() => of(true));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            const profile: Profile = {
                uid: 'sample_uid',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.SERVER,
                serverProfile: {}
            } as any;

            // act
            // assert
            expect(() => profileService.createProfile(profile, ProfileSource.SERVER)).not.toThrow();

            done();
        });


    });

    describe('deleteProfile()', () => {
        it('should delete profile from db on deleteProfile()', async (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => of([{} as Partial<ProfileEntry.SchemaMap>]));
            mockDbService.delete = jest.fn().mockImplementation(() => of(undefined));
            // spyOn(profileService, 'getActiveProfileSession').and.returnValue(of(new ProfileSession('SAMPLE_UID')));
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            return await profileService.deleteProfile('SAMPLE_UID').toPromise().then(() => {
                // assert
                expect(mockDbService.delete).toHaveBeenCalledWith(
                    expect.objectContaining({
                        table: ProfileEntry.TABLE_NAME
                    })
                );
                done();
            });
        });

        it('should delete profile from db only if profile in db on deleteProfile()', async (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => of([]));
            mockDbService.delete = jest.fn().mockImplementation(() => of(undefined));

            // act
            return await profileService.deleteProfile('SAMPLE_UID').toPromise().then(
                () => {
                },
                (err) => {
                    // assert
                    expect(err).toBeTruthy();
                    expect(mockDbService.delete).not.toHaveBeenCalled();
                    done();
                });
        });
    });

    describe('updateProfile()', () => {
        it('should update profile from db on updateProfile()', (done) => {
            // arrange
            const profile: Profile = {
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.LOCAL
            };
            mockDbService.read = jest.fn().mockImplementation(() => of([{
                [ProfileEntry.COLUMN_NAME_UID]: 'SAMPLE_UID',
                [ProfileEntry.COLUMN_NAME_HANDLE]: 'SAMPLE_HANDLE',
                [ProfileEntry.COLUMN_NAME_PROFILE_TYPE]: ProfileType.STUDENT,
                [ProfileEntry.COLUMN_NAME_SOURCE]: ProfileSource.LOCAL,
            } as ProfileEntry.SchemaMap]));
            mockDbService.update = jest.fn().mockImplementation(() => of(undefined));
            // spyOn(profileService, 'getActiveProfileSession').and.returnValue(of(new ProfileSession('SAMPLE_UID')));
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            profileService.updateProfile(profile).subscribe(() => {
                // assert
                expect(mockDbService.update).toHaveBeenCalledWith(
                    expect.objectContaining({
                        table: ProfileEntry.TABLE_NAME
                    })
                );
                done();
            });
        });

        it('should update profile from db only if profile in db on updateProfile()', async (done) => {
            // arrange
            const profile: Profile = {
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.LOCAL
            };
            mockDbService.read = jest.fn().mockImplementation(() => of(undefined));
            mockDbService.update = jest.fn().mockImplementation(() => of(undefined));

            // act
            await profileService.updateProfile(profile).toPromise().then(
                () => {
                },
                (err) => {
                    // assert
                    expect(err).toBeTruthy();
                    expect(mockDbService.update).not.toHaveBeenCalled();
                    jest.clearAllTimers();
                    done();
                });
        });
    });

    describe('updateServerProfile()', () => {
        it('should delegate to UpdateServerProfileHandler', (done) => {
            // arrange
            mockCsUserService.updateProfile = jest.fn(() => of({ response: 'SUCCESS'} as any));
            const request = {} as Partial<UpdateServerProfileInfoRequest>;

            // act
            profileService.updateServerProfile(request as UpdateServerProfileInfoRequest).subscribe((res) => {
                // assert
                expect(res).toEqual( { response: 'SUCCESS'});
                done();
            });
        });
    });

    describe('getTenantInfo()', () => {
        it('should delegate to TenantInfoHandler', (done) => {
            // arrange
            const response = {
                title: 'SAMPLE_TITLE',
                logo: 'SAMPLE_LOGO',
                poster: 'SAMPLE_POSTER',
                favicon: 'SAMPLE_FAVICON',
                appLogo: 'SAMPLE_APP_LOGO'
            } as TenantInfo;

            (TenantInfoHandler as jest.Mock<TenantInfoHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn().mockImplementation(() => of(response))
                } as Partial<TenantInfoHandler> as TenantInfoHandler;
            });

            const request = {} as Partial<TenantInfoRequest>;

            // act
            profileService.getTenantInfo(request as TenantInfoRequest).subscribe((res) => {
                // assert
                expect(res).toBe(response);
                done();
            });
        });
    });

    describe('getServerProfilesDetails()', () => {
        it('should delegate to GetServerProfileDetailsHandler', (done) => {
            // arrange
            const response = {
                identifier: 'SAMPLE_IDENTIFIER'
            } as Partial<ServerProfile>;

            (GetServerProfileDetailsHandler as jest.Mock<GetServerProfileDetailsHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn().mockImplementation(() => of(response))
                } as Partial<GetServerProfileDetailsHandler> as GetServerProfileDetailsHandler;
            });

            const request = {} as Partial<ServerProfileDetailsRequest>;

            // act
            profileService.getServerProfilesDetails(request as ServerProfileDetailsRequest).subscribe((res) => {
                // assert
                expect(res).toBe(response);
                done();
            });
        });
    });

    describe('acceptTermsAndConditions()', () => {
        it('should delegate to AcceptTermConditionHandler', (done) => {
            // arrange
            (AcceptTermConditionHandler as jest.Mock<AcceptTermConditionHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn().mockImplementation(() => of(true))
                } as Partial<AcceptTermConditionHandler> as AcceptTermConditionHandler;
            });

            const request = {} as Partial<AcceptTermsConditionRequest>;

            // act
            profileService.acceptTermsAndConditions(request as AcceptTermsConditionRequest).subscribe((res) => {
                // assert
                expect(res).toBe(true);
                done();
            });
        });
    });

    describe('isProfileAlreadyInUse()', () => {
        it('should delegate to IsProfileAlreadyInUseHandler', (done) => {
            // arrange
            const response = {
                response: 'SAMPLE_RESPONSE'
            } as Partial<ProfileExistsResponse>;

            (IsProfileAlreadyInUseHandler as jest.Mock<IsProfileAlreadyInUseHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn().mockImplementation(() => of(response))
                } as Partial<IsProfileAlreadyInUseHandler> as IsProfileAlreadyInUseHandler;
            });

            const request = {} as Partial<IsProfileAlreadyInUseRequest>;

            // act
            profileService.isProfileAlreadyInUse(request as IsProfileAlreadyInUseRequest).subscribe((res) => {
                // assert
                expect(res).toBe(response);
                done();
            });
        });
    });

    describe('generateOTP()', () => {
        it('should delegate to GenerateOtpHandler', (done) => {
            // arrange
            (GenerateOtpHandler as jest.Mock<GenerateOtpHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn().mockImplementation(() => of(false))
                } as Partial<GenerateOtpHandler> as GenerateOtpHandler;
            });

            const request = {} as Partial<GenerateOtpRequest>;

            // act
            profileService.generateOTP(request as IsProfileAlreadyInUseRequest).subscribe((res) => {
                // assert
                expect(res).toBe(false);
                done();
            });
        });
    });

    describe('verifyOTP()', () => {
        it('should delegate to VerifyOtpHandler', (done) => {
            // arrange
            (VerifyOtpHandler as jest.Mock<VerifyOtpHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn().mockImplementation(() => of(false))
                } as Partial<VerifyOtpHandler> as VerifyOtpHandler;
            });

            const request = {} as Partial<VerifyOtpRequest>;

            // act
            profileService.verifyOTP(request as VerifyOtpRequest).subscribe((res) => {
                // assert
                expect(res).toBe(false);
                done();
            });
        });
    });

    describe('searchLocation()', () => {
        it('should delegate to SearchLocationHandler', (done) => {
            // arrange
            const response: LocationSearchResult[] = [];
            (SearchLocationHandler as any as jest.Mock<SearchLocationHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn().mockImplementation(() => of(response))
                } as Partial<SearchLocationHandler> as SearchLocationHandler;
            });

            const request = {} as Partial<LocationSearchCriteria>;

            // act
            profileService.searchLocation(request as LocationSearchCriteria).subscribe((res) => {
                // assert
                expect(res).toBe(response);
                done();
            });
        });
    });

    describe('isDefaultChannelProfile()', () => {
        it('should resolve true if default channel identifier matches active channel id', (done) => {
            // arrange
            const sampleChannel = {
                identifier: 'SAMPLE_CHANNEL'
            } as Partial<Channel>;
            mockFrameworkService.getDefaultChannelDetails = () => of(sampleChannel as Channel);
            mockFrameworkService.getActiveChannelId = () => of('SAMPLE_CHANNEL');
            mockFrameworkService.getDefaultChannelId = () => of('DEFAULT_CHANNEL');

            // act
            profileService.isDefaultChannelProfile().subscribe((isDefaultChannelProfile) => {
                expect(isDefaultChannelProfile).toBe(false);
                done();
            });
        });

        it('should resolve false if default channel identifier matches active channel id', (done) => {
            // arrange
            const sampleChannel = {
                identifier: 'SAMPLE_CHANNEL'
            } as Partial<Channel>;
            mockFrameworkService.getDefaultChannelDetails = () => of(sampleChannel as Channel);
            mockFrameworkService.getActiveChannelId = () => of('SAMPLE_CHANNEL_1');

            // act
            profileService.isDefaultChannelProfile().subscribe((isDefaultChannelProfile) => {
                expect(isDefaultChannelProfile).toBe(false);
                done();
            });
        });
    });

    describe('mergeServerProfiles()', () => {
        it('should invoke merge API call and finally logout the user', (done) => {
            // arrange
            mockSdkConfig.apiConfig = {
                user_authentication: {
                    mergeUserHost: 'SAMPLE_HOST',
                    autoMergeApiPath: 'SAMPLE_AUTO_MERGE_API_PATH'
                }
            } as any;
            mockApiService.fetch = jest.fn().mockImplementation(() => of(new Response()));
            const request: MergeServerProfilesRequest = {
                from: {
                    userId: 'SAMPLE_USER_ID',
                    accessToken: 'SAMPLE_ACCESS_TOKEN',
                },
                to: {
                    userId: 'SAMPLE_USER_ID_2',
                    accessToken: 'SAMPLE_ACCESS_TOKEN_2'
                }
            };
            jest.spyOn(global['cordova']['InAppBrowser'], 'open').mockImplementation(() => {
                return {
                    addEventListener: (_, cb) => {
                        cb({ url: 'xyz/oauth2callback' });
                    },
                    close: () => { }
                };
            });
            // act
            profileService.mergeServerProfiles(request).subscribe(() => {
                // assert
                expect(mockApiService.fetch).toHaveBeenCalledWith(
                    expect.objectContaining({
                        body: expect.objectContaining({
                            request: expect.objectContaining({
                                fromAccountId: 'SAMPLE_USER_ID',
                                toAccountId: 'SAMPLE_USER_ID_2'
                            })
                        }),
                        headers: expect.objectContaining({
                            'x-source-user-token': 'SAMPLE_ACCESS_TOKEN',
                            'x-authenticated-user-token': 'SAMPLE_ACCESS_TOKEN_2'
                        }),
                    })
                );
                done();
            });
        });
    });

    describe('getActiveProfileSession', () => {
        it('should resolve if profile session exists', (done) => {
            // arrange
            const response = JSON.stringify({uid: 'SAMPLE_UID'});
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(response));
            // act
            profileService.getActiveProfileSession().subscribe((res) => {
                expect(res).toBeTruthy();
                expect(res.uid).toEqual('SAMPLE_UID');
                done();
            });
        });

        it('should reject if profile session does not exist', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(undefined));

            // act
            profileService.getActiveProfileSession().subscribe(null, (e) => {
                expect(e instanceof NoActiveSessionError).toBeTruthy();
                done();
            });
        });
    });

    describe('getAllProfiles()', () => {
        it('should resolve with all profiles if no profile request filter is passed', (done) => {
            // arrange
            const response = [];
            mockDbService.read = jest.fn().mockImplementation(() => of(response));
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => {
                // const profileSession = new ProfileSession('SAMPLE_UID');
                return of(JSON.stringify({
                    uid: 'uid',
                    sid: 'sid',
                    createdTime: 'createdTime'
                }));
            });
            // act
            profileService.getAllProfiles().subscribe((res) => {
                expect(mockDbService.read).toHaveBeenCalledWith(
                    expect.objectContaining({
                        table: ProfileEntry.TABLE_NAME,
                        columns: expect.arrayContaining([])
                    })
                );
                done();
            });
        });

        it('should resolve with all profiles filtered by groupId in request', (done) => {
            // arrange
            const response = [];
            const profileRequest = {local: true} as GetAllProfileRequest;
            mockDbService.read = jest.fn().mockImplementation(() => of(response));

            // act
            profileService.getAllProfiles(profileRequest as GetAllProfileRequest).subscribe((res) => {
                expect(mockDbService.read).toHaveBeenCalledWith(
                    expect.objectContaining({
                        table: ProfileEntry.TABLE_NAME,
                        selection: `${ProfileEntry.COLUMN_NAME_SOURCE} = ?`,
                        selectionArgs: [profileRequest.local ? ProfileSource.LOCAL : ProfileSource.SERVER],
                        columns: expect.arrayContaining([])
                    })
                );
                done();
            });
        });

        it('should resolve with all profiles filtered by groupId and (local or server) in request', (done) => {
            // arrange
            const response = [];
            const profileRequest = {groupId: 'SAMPLE_GROUP_ID', local: true} as GetAllProfileRequest;
            mockDbService.execute = jest.fn().mockImplementation(() => of(response));

            // act
            profileService.getAllProfiles(profileRequest as GetAllProfileRequest).subscribe((res) => {
                expect(mockDbService.execute).toHaveBeenCalledWith(expect.any(String));
                done();
            });
        });



        it('should resolve with all profiles filtered by  groupid and server = true  in request', (done) => {
            // arrange
            const response = [{uid: '1', source: 'server'}];
            const profileRequest = {groupId: 'SAMPLE_GROUP_ID', server: true} as GetAllProfileRequest;
            mockDbService.execute = jest.fn().mockImplementation(() => of(response));

            // act
            profileService.getAllProfiles(profileRequest as GetAllProfileRequest).subscribe((res) => {
                expect(mockDbService.execute).toHaveBeenCalledWith(expect.any(String));
                done();
            });
        });
    });

    describe('getActiveSessionProfile()', () => {
        it('should reject if no profile in DB for session profile', (done) => {
            // arrange
            const request = {requiredFields: []} as Pick<ServerProfileDetailsRequest, 'requiredFields'>;
            mockDbService.read = jest.fn().mockImplementation(() => of([]));
            spyOn(profileService, 'getActiveProfileSession').and.returnValue(of({uid: 'SAMPLE_UID'}));

            // act
            profileService.getActiveSessionProfile(request).subscribe(null, (e) => {
                expect(e instanceof NoProfileFoundError).toBeTruthy();
                done();
            });
        });

        it('should resolve if local profile in DB for session profile', (done) => {
            // arrange
            const request = {requiredFields: []} as Pick<ServerProfileDetailsRequest, 'requiredFields'>;
            mockDbService.read = jest.fn().mockImplementation(() => of([{
                [ProfileEntry.COLUMN_NAME_UID]: 'SAMPLE_UID'
            }]));
            spyOn(profileService, 'getActiveProfileSession').and.returnValue(of({uid: 'SAMPLE_UID'}));

            // act
            profileService.getActiveSessionProfile(request).subscribe((res) => {
                expect(res.uid).toEqual('SAMPLE_UID');
                done();
            });
        });

        it('should resolve if server profile in DB for session profile', (done) => {
            // arrange
            const request = {requiredFields: []} as Pick<ServerProfileDetailsRequest, 'requiredFields'>;
            mockDbService.read = jest.fn().mockImplementation(() => of([{
                [ProfileEntry.COLUMN_NAME_UID]: 'SAMPLE_UID',
                [ProfileEntry.COLUMN_NAME_SOURCE]: ProfileSource.SERVER
            }]));
            spyOn(profileService, 'getActiveProfileSession').and.returnValue(of({uid: 'SAMPLE_UID'}));
            spyOn(profileService, 'getServerProfilesDetails').and.returnValue(of({uid: 'SAMPLE_UID'}));

            // act
            profileService.getActiveSessionProfile(request).subscribe((res) => {
                expect(profileService.getServerProfilesDetails).toHaveBeenCalled();
                expect(res.uid).toEqual('SAMPLE_UID');
                done();
            });
        });
    });

    describe('setActiveSessionForProfile', () => {
        beforeEach(() => {
            jest.spyOn(CsModule.instance, 'isInitialised', 'get').mockReturnValue(false);
        });

        it('should update CsModule session ID configuration', (done) => {
            // arrange
            mockSdkConfig.apiConfig = {
                api_authentication: {
                    channelId: 'SAMPLE_CHANNEL_ID'
                }
            } as any;
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            mockDbService.read = jest.fn().mockImplementation(() => of([
                {
                    [ProfileEntry.COLUMN_NAME_UID]: 'SAMPLE_UID',
                    [ProfileEntry.COLUMN_NAME_SOURCE]: ProfileSource.LOCAL
                }
            ]));
            mockFrameworkService.setActiveChannelId = jest.fn().mockImplementation(() => of(undefined));
            mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));
            jest.spyOn(CsModule.instance, 'isInitialised', 'get').mockReturnValue(true);
            jest.spyOn(CsModule.instance, 'config', 'get').mockReturnValue({
                core: {
                    httpAdapter: 'HttpClientCordovaAdapter',
                    global: {
                        channelId: 'channelId',
                        producerId: 'producerId',
                        deviceId: 'deviceId'
                    },
                    api: {
                        host: 'host',
                        authentication: {}
                    }
                },
                services: {}
            });
            spyOn(CsModule.instance, 'updateConfig').and.returnValue(undefined);

            // act
            profileService.setActiveSessionForProfile('SAMPLE_UID').subscribe((res) => {
                // assert
                expect(CsModule.instance.updateConfig).toHaveBeenCalledWith({
                    core: {
                        httpAdapter: 'HttpClientCordovaAdapter',
                        global: {
                            channelId: 'channelId',
                            producerId: 'producerId',
                            deviceId: 'deviceId',
                            sessionId: expect.any(String)
                        },
                        api: {
                            host: 'host',
                            authentication: {}
                        }
                    },
                    services: {}
                });
                expect(mockFrameworkService.setActiveChannelId).toHaveBeenCalledWith('SAMPLE_CHANNEL_ID');
                expect(res).toBeTruthy();
                done();
            });
        });

        it('should reject if not profile in db for profile id in request', (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => of([]));

            // act
            profileService.setActiveSessionForProfile('SAMPLE_UID').subscribe(null, (e) => {
                // assert
                expect(e instanceof NoProfileFoundError).toBeTruthy();
                done();
            });
        });

        it('should set default channelId if local profile in db for profile id in request', (done) => {
            // arrange
            mockSdkConfig.apiConfig = {
                api_authentication: {
                    channelId: 'SAMPLE_CHANNEL_ID'
                }
            } as any;
            mockDbService.read = jest.fn().mockImplementation(() => of([
                {
                    [ProfileEntry.COLUMN_NAME_UID]: 'SAMPLE_UID',
                    [ProfileEntry.COLUMN_NAME_SOURCE]: ProfileSource.LOCAL
                }
            ]));
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            mockFrameworkService.setActiveChannelId = jest.fn().mockImplementation(() => of(undefined));
            mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

            // act
            profileService.setActiveSessionForProfile('SAMPLE_UID').subscribe((res) => {
                // assert
                expect(mockFrameworkService.setActiveChannelId).toHaveBeenCalledWith('SAMPLE_CHANNEL_ID');
                expect(res).toBeTruthy();
                done();
            });
        });

        it('should set rootOrg channelId if server profile in db for profile id in request', (done) => {
            // arrange
            mockSdkConfig.apiConfig = {
                api_authentication: {
                    channelId: 'SAMPLE_CHANNEL_ID'
                }
            } as any;
            mockDbService.read = jest.fn().mockImplementation(() => of([
                {
                    [ProfileEntry.COLUMN_NAME_UID]: 'SAMPLE_UID',
                    [ProfileEntry.COLUMN_NAME_SOURCE]: ProfileSource.SERVER
                }
            ]));
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            spyOn(profileService, 'getServerProfilesDetails').and.returnValue(of({
                rootOrg: {
                    hashTagId: 'SAMPLE_ROOT_ORG_ID'
                }
            }));
            mockFrameworkService.setActiveChannelId = jest.fn().mockImplementation(() => of(undefined));
            mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

            // act
            profileService.setActiveSessionForProfile('SAMPLE_UID').subscribe((res) => {
                // assert
                expect(mockFrameworkService.setActiveChannelId).toHaveBeenCalledWith('SAMPLE_ROOT_ORG_ID');
                expect(res).toBeTruthy();
                done();
            });
        });
    });

    describe('getAllContentAccess', () => {
        it('should return all accesssable content using content filetr criteria', (done) => {
            // arrange
            const request: ContentAccessFilterCriteria = {
                contentId: 'sample-content_id',
                uid: 'sample-uid'
            };
            jest.spyOn(ContentUtil, 'getUidnIdentifierFiler').mockReturnValue('where uid=sample-uid');
            mockDbService.execute = jest.fn().mockImplementation(() => of([{uid: 'sample-uid'}]));
            // act
            profileService.getAllContentAccess(request).subscribe(() => {
                // assert
                expect(mockDbService.execute).toHaveBeenCalledWith('SELECT * FROM content_access where uid=sample-uid');
                done();
            });
        });
    });

    describe('addContentAccess', () => {
        it('shuld find access content and update content', (done) => {
            // arrange
            const learnerData: ContentLearnerState = {
                learnerState: {'key': 'sample-key'}
            };
            const request: ContentAccess = {
                status: ContentAccessStatus.PLAYED,
                contentId: 'sample-content-id',
                contentType: 'sample-content-type',
                contentLearnerState: learnerData,
                primaryCategory: 'TextBook'
            };
            jest.spyOn(profileService, 'getActiveProfileSession').mockReturnValue(of({
                _uid: 'sample-uid',
                _sid: 'sample-sid'
            } as Partial<ProfileSession> as ProfileSession));
            mockDbService.read = jest.fn().mockImplementation(() => of([{}]));
            mockDbService.update = jest.fn().mockImplementation(() => of(1));
            // act
            profileService.addContentAccess(request).subscribe(() => {
                // assert
                expect(mockDbService.read).toHaveBeenCalled();
                expect(mockDbService.update).toHaveBeenCalled();
                done();
            });
        });

        it('shuld find access content and insert new content', (done) => {
            // arrange
            const learnerData: ContentLearnerState = {
                learnerState: {'key': 'sample-key'}
            };
            const request: ContentAccess = {
                status: ContentAccessStatus.PLAYED,
                contentId: 'sample-content-id',
                contentType: 'sample-content-type',
                contentLearnerState: learnerData,
                primaryCategory: 'TextBook'
            };
            jest.spyOn(profileService, 'getActiveProfileSession').mockReturnValue(of({
                _uid: 'sample-uid',
                _sid: 'sample-sid'
            } as Partial<ProfileSession> as ProfileSession));
            mockDbService.read = jest.fn().mockImplementation(() => of([]));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            // act
            profileService.addContentAccess(request).subscribe(() => {
                // assert
                expect(mockDbService.read).toHaveBeenCalled();
                expect(mockDbService.insert).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('exportProfile', () => {
        it('should return epar file path and cleanup epar file and create a directory', (done) => {
            // arrange
            const request: ProfileExportRequest = {
                userIds: ['user-1'],
                groupIds: ['group-1'],
                destinationFolder: 'sample-destination-folder'
            };
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            mockFileService.createDir = jest.fn().mockImplementation(() => Promise.resolve({}));
            mockFileService.createFile = jest.fn().mockImplementation(() => Promise.resolve({}));
            mockDbService.copyDatabase = jest.fn().mockImplementation(() => of(true));
            mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('sample-device-id'));
            mockDbService.open = jest.fn().mockImplementation(() => Promise.resolve(undefined));
            mockDbService.execute = jest.fn().mockImplementation(() => of({}));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            mockDbService.read = jest.fn().mockImplementation(() => of([{uid: 'sample-uid'}]));
            // act
            profileService.exportProfile(request).subscribe(() => {
                // assert
                expect(mockFileService.createDir).toHaveBeenCalled();
                expect(mockFileService.createFile).toHaveBeenCalled();
                expect(mockDbService.copyDatabase).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                expect(mockDbService.open).toHaveBeenCalled();
                expect(mockDbService.execute).toHaveBeenCalled();
                expect(mockDbService.insert).toHaveBeenCalled();
                expect(mockDbService.execute).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('importProfile', () => {
        it('should be valid profile metaData', (done) => {
            // arrange
            const request: ProfileImportRequest = {
                sourceFilePath: 'src/file/profile'
            };
            const response = {
                response: 'SAMPLE_RESPONSE',
                failed: 'err',
                imported: 'sample'
            };
            mockDbService.read = jest.fn().mockImplementation((req) => {
                if (req.useExternalDb) {
                    return of([{
                        uid: 'sample-uid',
                        gid: 'sample-gid'
                    }]);
                }
                return of([]);
            });

            (ValidateProfileMetadata as jest.Mock<ValidateProfileMetadata>).mockImplementation(() => {
                return {
                    execute: jest.fn().mockImplementation(() => Promise.resolve(response))
                } as Partial<ValidateProfileMetadata> as ValidateProfileMetadata;
            });
            (TransportProfiles as jest.Mock<TransportProfiles>).mockImplementation(() => {
                return {
                    execute: jest.fn().mockImplementation(() => Promise.resolve(response))
                } as Partial<TransportProfiles> as TransportProfiles;
            });
            (TransportGroup as jest.Mock<TransportGroup>).mockImplementation(() => {
                return {
                    execute: jest.fn().mockImplementation(() => Promise.resolve(response))
                } as Partial<TransportGroup> as TransportGroup;
            });
            (UpdateImportedProfileMetadata as jest.Mock<UpdateImportedProfileMetadata>).mockImplementation(() => {
                return {
                    execute: jest.fn().mockImplementation(() => Promise.resolve({body: {failed: 'FAILED', imported: 'IMPORT'}}))
                } as Partial<UpdateImportedProfileMetadata> as UpdateImportedProfileMetadata;
            });
            mockDbService.execute = jest.fn().mockImplementation(() => of({body: {imported: 'sample'}}));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            // act
            profileService.importProfile(request).subscribe(() => {
                // assert
                expect(mockDbService.read).toHaveBeenCalled();
                expect(mockDbService.execute).toHaveBeenCalled();
                expect(mockDbService.insert).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('userMigrate', () => {
        it('should be maigrate', (done) => {
            // arrange
            const request: UserMigrateRequest = {
                userId: 'sample-user',
                action: 'reject'
            };
            const response = {
                response: 'SAMPLE_RESPONSE',
                failed: 'err',
                imported: 'sample'
            };
            (UserMigrateHandler as any as jest.Mock<UserMigrateHandler>).mockImplementation(() => {
                return {
                    handle: jest.fn().mockImplementation(() => of(response))
                } as Partial<UserMigrateHandler> as UserMigrateHandler;
            });
            // act
            profileService.userMigrate(request).subscribe((res) => {
                // assert
                expect(res).toBe(response);
                done();
            });
        });
    });

    describe('updateServerProfileDeclarations()', () => {
        it('should delegate to CsUserService.updateUserDeclarations() with v1 endpoint', (done) => {
            // arrange
            mockCsUserService.updateUserDeclarations = jest.fn(() => of({}));

            const declarations = [];
            const request = {
                declarations
            };

            profileService.updateServerProfileDeclarations(request).subscribe(() => {
                expect(mockCsUserService.updateUserDeclarations).toHaveBeenCalledWith(declarations, {apiPath: 'MOCK_V1_API_PATH'});
                done();
            });
        });
    });

    describe('deleteProfileData', () => {
        it('should delete profile data successfully', (done) => {
            //arrange
            const uid = 'testUid';
            jest.spyOn(DeleteProfileDataHandler.prototype, 'delete').mockReturnValueOnce(of(true));
    
            //act
            profileService.deleteProfileData(uid).subscribe((result: boolean) => {
                //assert
                expect(result).toBe(true);
                expect(DeleteProfileDataHandler.prototype.delete).toHaveBeenCalledWith(uid);
                done();
            });
        });
    })
});
