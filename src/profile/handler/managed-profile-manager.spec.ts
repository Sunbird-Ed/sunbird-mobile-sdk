import {ManagedProfileManager} from './managed-profile-manager';
import {AuthService, OAuthSession} from '../../auth';
import {NoActiveSessionError, ProfileService, ProfileServiceConfig, ProfileSource, ProfileType} from '..';
import {ApiService, Response} from '../../api';
import {CachedItemRequestSourceFrom, CachedItemStore} from '../../key-value-store';
import {DbService} from '../../db';
import {FrameworkService} from '../../framework';
import {SharedPreferences} from '../../util/shared-preferences';
import {of} from 'rxjs';
import {TelemetryLogger} from '../../telemetry/util/telemetry-logger';
import {TelemetryService} from '../../telemetry';
import {ProfileEntry} from '../db/schema';
import {tap} from 'rxjs/operators';
import { UniqueId } from '../../db/util/unique-id';

jest.mock('../../telemetry/util/telemetry-logger');

describe('ManagedProfileManager', () => {
    let managedProfileManager: ManagedProfileManager;

    const mockProfileService: Partial<ProfileService> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockProfileServiceConfig: Partial<ProfileServiceConfig> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockDbService: Partial<DbService> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        managedProfileManager = new ManagedProfileManager(
            mockProfileService as ProfileService,
            mockAuthService as AuthService,
            mockProfileServiceConfig as ProfileServiceConfig,
            mockApiService as ApiService,
            mockCachedItemStore as CachedItemStore,
            mockDbService as DbService,
            mockFrameworkService as FrameworkService,
            mockSharedPreferences as SharedPreferences,
        );
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it('should be able to create an instance', () => {
        // assert
        expect(managedProfileManager).toBeTruthy();
    });

    describe('addManagedProfile', () => {
        it('should throw error if user is not loggedIn', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(undefined));

            // act
            managedProfileManager.addManagedProfile({
                firstName: 'sample_name',
                managedBy: 'sample_uid'
            }).subscribe(() => {
                fail();
            }, (err) => {
                // assert
                expect(err instanceof NoActiveSessionError).toBeTruthy();
                done();
            });
        });

        it('should be able to create a managedProfile if loggedIn', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of({
                userToken: 'some_user_token'
            } as OAuthSession));

            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                uid: 'sample_uid',
                handle: 'sample_handle',
                profileType: ProfileType.TEACHER,
                source: ProfileSource.SERVER,
                serverProfile: {} as any
            }));

            const response = new Response();
            response.body = {
                result: {
                    userId: 'sample_user_id_1'
                }
            };
            mockApiService.fetch = jest.fn(() => of(response));

            mockProfileService.getServerProfilesDetails = jest.fn(() => of({
                tncLatestVersion: 'v4'
            } as any));

            // act
            managedProfileManager.addManagedProfile({
                firstName: 'sample_name',
                managedBy: 'sample_user_uid'
            }).subscribe((profileData) => {
                // assert
                expect(profileData.uid).toBe(response.body.result.userId);
                done();
            });
        });
    });

    describe('getManagedServerProfiles', () => {
        it('should throw error if user not loggedIn', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of(undefined));

            // act
            managedProfileManager.getManagedServerProfiles({
                from: CachedItemRequestSourceFrom.SERVER,
                requiredFields: []
            }).subscribe(() => {
                fail();
            }, (err) => {
                // assert
                expect(err instanceof NoActiveSessionError).toBeTruthy();
                done();
            });
        });

        it('should return managedProfiles for loggedIn user and persist them in DB', (done) => {
            // arrange
            mockAuthService.getSession = jest.fn(() => of({
                userToken: 'some_user_token'
            } as OAuthSession));

            mockProfileService.getActiveSessionProfile = jest.fn(() => of({
                uid: 'sample_uid',
                handle: 'sample_handle',
                profileType: ProfileType.TEACHER,
                source: ProfileSource.SERVER,
                serverProfile: {} as any
            }));

            mockProfileService.getServerProfilesDetails = jest.fn(() => of({
                serverProfile: {}
            } as any));

            const response = new Response();
            response.body = {
                result: {
                    response: {
                        content: []
                    }
                }
            };
            mockApiService.fetch = jest.fn(() => of(response));

            mockCachedItemStore.get = jest.fn((_, __, ___, cb) => {
                return cb();
            }) as any;

            mockDbService.execute = jest.fn(() => of([]));

            const createdProfile = {
                uid: 'sample_uid',
                handle: 'sample_handle',
                profileType: ProfileType.TEACHER,
                source: ProfileSource.SERVER,
                serverProfile: {} as any
            };
            mockProfileService.createProfile = jest.fn(() => of(createdProfile));

            mockCachedItemStore.getCached = jest.fn(() => of(undefined).pipe(
                tap(() => done())
            )) as any;

            // act
            managedProfileManager.getManagedServerProfiles({
                from: CachedItemRequestSourceFrom.SERVER,
                requiredFields: []
            }).subscribe();
        });
    });

    describe('switchSessionToManagedProfile', () => {
        it('should create new profile session for managed profile updating current authSession', (done) => {
            // arrange
            mockProfileService.getActiveProfileSession = jest.fn(() => of({
                uid: 'sample_uid',
                sid: 'sample_sid',
                createdTime: 12345,
            }));
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            const mockTelemetryService: Partial<TelemetryService> = {
                end: jest.fn().mockImplementation(() => of(undefined)),
                start: jest.fn().mockImplementation(() => of(undefined))
            };
            (TelemetryLogger as any)['log'] = mockTelemetryService;

            mockDbService.read = jest.fn(() => of([{
                [ProfileEntry.COLUMN_NAME_UID]: 'sample_uid',
                [ProfileEntry.COLUMN_NAME_HANDLE]: 'sample_handle',
                [ProfileEntry.COLUMN_NAME_CREATED_AT]: 12345,
                [ProfileEntry.COLUMN_NAME_MEDIUM]: '',
                [ProfileEntry.COLUMN_NAME_BOARD]: '',
                [ProfileEntry.COLUMN_NAME_SUBJECT]: '',
                [ProfileEntry.COLUMN_NAME_PROFILE_TYPE]: ProfileType.TEACHER,
                [ProfileEntry.COLUMN_NAME_GRADE]: '',
                [ProfileEntry.COLUMN_NAME_SYLLABUS]: '',
                [ProfileEntry.COLUMN_NAME_SOURCE]: ProfileSource.SERVER,
                [ProfileEntry.COLUMN_NAME_GRADE_VALUE]: '',
            }]));

            mockFrameworkService.setActiveChannelId = jest.fn(() => of(undefined));

            mockSharedPreferences.putString = jest.fn(() => of(undefined));

            mockProfileService.getServerProfilesDetails = jest.fn(() => of({
                firstName: 'first_name',
                uid: 'some_uid',
                rootOrg: {
                    hashTagId: 'some_root_org_id'
                }
            } as any));

            const createdProfile = {
                uid: 'sample_uid',
                handle: 'sample_handle',
                profileType: ProfileType.TEACHER,
                source: ProfileSource.SERVER,
                serverProfile: {} as any
            };

            mockProfileService.createProfile = jest.fn(() => of(createdProfile));
            mockAuthService.getSession = jest.fn(() => of({
                access_token: 'some_access_token',
                refresh_token: 'some_refresh_token',
                userToken: 'some_previous_uid'
            }));
            mockAuthService.setSession = jest.fn(() => of(undefined));

            spyOn(managedProfileManager, 'getManagedServerProfiles').and.returnValue(
                of([{id: 'some_uid', managedToken: 'some_managed_token'}])
            );

            mockAuthService.getSession = jest.fn(() => of({
                access_token: 'some_access_token',
                refresh_token: 'some_refresh_token',
                userToken: 'some_access_token',
                managed_access_token: 'some_old_managed_token'
            } as OAuthSession));

            mockAuthService.setSession = jest.fn(() => of(undefined));

            // act
            managedProfileManager.switchSessionToManagedProfile({
                uid: 'some_uid'
            }).subscribe(() => {
                setTimeout(() => {
                    expect(mockAuthService.setSession).toBeCalled();
                    expect(mockFrameworkService.setActiveChannelId).toBeCalledWith('some_root_org_id');
                    expect(mockAuthService.setSession).toHaveBeenCalled();
                    done();
                }, 0);
            }, (e) => {
                fail(e);
            });
        });
    });
});
