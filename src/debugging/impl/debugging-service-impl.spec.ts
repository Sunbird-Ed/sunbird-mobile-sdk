import { CsClientStorage } from '@project-sunbird/client-services/core';
import { of } from 'rxjs';
import { SharedPreferences } from '../..';
import { ProfileService } from '../../profile';
import { DebuggingServiceImpl } from './debuggin-service-impl';

describe('DebuggingServiceImpl', () => {
    let debuggingServiceImpl: DebuggingServiceImpl;
    const mockProfileService: Partial<ProfileService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};

    beforeAll(() => {
        debuggingServiceImpl = new DebuggingServiceImpl(
            mockSharedPreferences as SharedPreferences,
            mockProfileService as ProfileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of debuggingServiceImpl', () => {
        expect(debuggingServiceImpl).toBeTruthy();
    });

    describe('enableDebugging', () => {
        it('should enable debug for traceId', (done) => {
            // arrange
            const req = 'trace_id';
            debuggingServiceImpl.deviceId = 'device-id';
            debuggingServiceImpl.userId = 'u-id';
            mockProfileService.getActiveProfileSession = jest.fn(() => of({ uid: 'sample-uid' } as any));
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockSharedPreferences.getString = jest.fn(() => of(undefined));
            // act
            debuggingServiceImpl.enableDebugging(req).subscribe(() => {
                // assert
                expect(debuggingServiceImpl.deviceId).toBeTruthy();
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith(CsClientStorage.TRACE_ID, req);
                expect(mockSharedPreferences.getString).toHaveBeenCalled();
                done();
            });
        });

        it('should be enable debug for undefined traceId', (done) => {
            // arrange
            debuggingServiceImpl.deviceId = 'device-id';
            debuggingServiceImpl.userId = 'u-id';
            mockProfileService.getActiveProfileSession = jest.fn(() => of({ uid: 'sample-uid' } as any));
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockSharedPreferences.getString = jest.fn(() => of(undefined));
            // act
            debuggingServiceImpl.enableDebugging().subscribe(() => {
                // assert
                expect(debuggingServiceImpl.deviceId).toBeTruthy();
                expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith(CsClientStorage.TRACE_ID,
                    'eyJhbGciOiJIUzI1NiJ9.ZGV2aWNlLWlk.Nchtt0jtpaZAwtNGKYGAbg447UZbe0mepDBYiRcpU34');
                expect(mockSharedPreferences.getString).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('disableDebugging', () => {
        it('should disable debug option', (done) => {
            debuggingServiceImpl.watcher = {
                debugStatus: true,
                observer: {
                    complete: jest.fn()
                }
            } as any;
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            debuggingServiceImpl.disableDebugging().subscribe(() => {
                expect(mockSharedPreferences.putString).toHaveBeenNthCalledWith(1, 'debug_started_at', '');
                expect(mockSharedPreferences.putString).toHaveBeenNthCalledWith(2, CsClientStorage.TRACE_ID, '');
                done();
            });
        });

        it('should not disable debug option depends on debugStatus', (done) => {
            debuggingServiceImpl.watcher = {
                debugStatus: false,
                observer: {
                    complete: jest.fn()
                }
            } as any;
            debuggingServiceImpl.disableDebugging().subscribe((data) => {
                expect(data).toBeFalsy();
                done();
            });
        });
    });

    describe('isDebugOn', () => {
        it('should return true if debug is on', () => {
            debuggingServiceImpl.watcher = {
                debugStatus: true
            } as any;
            const isDebugOn = debuggingServiceImpl.isDebugOn();
            expect(isDebugOn).toBeTruthy();
        });

        it('should return false if debug is off', () => {
            debuggingServiceImpl.watcher = {
                debugStatus: false
            } as any;
            const isDebugOn = debuggingServiceImpl.isDebugOn();
            expect(isDebugOn).toBeFalsy();
        });
    });
});
