import {Profile, ProfileService, ProfileServiceImpl, ProfileSession, ProfileSource, ProfileType} from '..';
import {Container} from 'inversify';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {TelemetryAuditRequest, TelemetryService} from '../../telemetry';
import {SdkConfig} from '../../sdk-config';
import {DbService} from '../../db';
import {ApiService} from '../../api';
import {CachedItemStore, KeyValueStore} from '../../key-value-store';
import {FrameworkService} from '../../framework';
import {FileService} from '../../util/file/def/file-service';
import {InjectionTokens} from '../../injection-tokens';
import {Observable} from 'rxjs';
import {ProfileEntry} from '../db/schema';

describe.only('ProfileServiceImpl', () => {
    let profileService: ProfileService;

    const container = new Container();
    const mockSdkConfig: Partial<SdkConfig> = {};
    const mockDbService: Partial<DbService> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockTelemetryService: Partial<TelemetryService> = {
        audit(request: TelemetryAuditRequest): Observable<boolean> {
            return Observable.of(true);
        }
    };

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
        container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).toConstantValue(mockTelemetryService as TelemetryService);

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
            mockSharedPreferences.getString = jest.fn(() => {
                const profileSession = new ProfileSession('SAMPLE_UID');
                return Observable.of(JSON.stringify({
                    uid: profileSession.uid,
                    sid: profileSession.sid,
                    createdTime: profileSession.createdTime
                }));
            });
            spyOn(profileService, 'createProfile').and.stub();
            spyOn(profileService, 'setActiveSessionForProfile').and.returnValue(Observable.of(true));

            // act
            profileService.preInit().subscribe(() => {
                // assert
                expect(profileService.createProfile).not.toBeCalled();
                expect(profileService.setActiveSessionForProfile).toBeCalledWith('SAMPLE_UID');
                done();
            });
        });

        it('should create new Profile and Session if no Profile exists on preInit()', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn(() => Observable.of(undefined));
            spyOn(profileService, 'createProfile').and.returnValue(Observable.of({
                uid: 'SAMPLE_UID'
            }) as Partial<ProfileSession>);
            spyOn(profileService, 'setActiveSessionForProfile').and.returnValue(Observable.of(true));

            // act
            profileService.preInit().subscribe(() => {
                // assert
                expect(profileService.createProfile).toBeCalled();
                expect(profileService.setActiveSessionForProfile).toBeCalledWith('SAMPLE_UID');
                done();
            });
        });
    });

    describe('createProfile()', () => {
        it('should create a profile saved in db on createProfile()', (done) => {
            // arrange
            mockDbService.insert = jest.fn(() => Observable.of(1));
            const profile: Profile = {
                uid: 'SAMPLE_UID',
                handle: 'SAMPLE_HANDLE',
                profileType: ProfileType.STUDENT,
                source: ProfileSource.LOCAL
            };

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
            mockTelemetryService.audit = jest.fn(() => Observable.of(true));
            mockDbService.insert = jest.fn(() => Observable.of(1));
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
    });

    describe('deleteProfile()', () => {
        it('should delete profile from db on deleteProfile()', async (done) => {
            // arrange
            expect.assertions(1);
            mockDbService.read = jest.fn(() => Observable.of([{} as Partial<ProfileEntry.SchemaMap>]));
            mockDbService.delete = jest.fn(() => Observable.of(undefined));
            spyOn(profileService, 'getActiveProfileSession').and.returnValue(Observable.of(new ProfileSession('SAMPLE_UID')));

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
            mockDbService.read = jest.fn(() => Observable.of([]));
            mockDbService.delete = jest.fn(() => Observable.of(undefined));

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
            mockDbService.read = jest.fn(() => Observable.of([{
                [ProfileEntry.COLUMN_NAME_UID]: 'SAMPLE_UID',
                [ProfileEntry.COLUMN_NAME_HANDLE]: 'SAMPLE_HANDLE',
                [ProfileEntry.COLUMN_NAME_PROFILE_TYPE]: ProfileType.STUDENT,
                [ProfileEntry.COLUMN_NAME_SOURCE]: ProfileSource.LOCAL,
            } as ProfileEntry.SchemaMap]));
            mockDbService.update = jest.fn(() => Observable.of(undefined));
            spyOn(profileService, 'getActiveProfileSession').and.returnValue(Observable.of(new ProfileSession('SAMPLE_UID')));

            // act
            profileService.updateProfile(profile).subscribe(() => {
                // assert
                setImmediate(() => {
                    expect(mockDbService.update).toHaveBeenCalledWith(
                        expect.objectContaining({
                            table: ProfileEntry.TABLE_NAME
                        })
                    );
                    done();
                });
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
            mockDbService.read = jest.fn(() => Observable.of(undefined));
            mockDbService.update = jest.fn(() => Observable.of(undefined));

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
});
