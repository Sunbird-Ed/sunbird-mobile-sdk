import { CsClientStorage } from '@project-sunbird/client-services/core';
import { of } from 'rxjs';
import { DebuggingServiceImpl } from '..';
import { SharedPreferences } from '../..';
import { DebuggingDurationHandler } from './debugging-duration-handler';
describe('DebuggingDurationHandler', () => {
    let debuggingDurationHandler: DebuggingDurationHandler;
    const mockDebuggingServiceImpl: Partial<DebuggingServiceImpl> = {
        watcher: {
            interval: 10000,
            observer: {},
            debugStatus: true
        }
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {}

    beforeAll(() => {
        debuggingDurationHandler = new DebuggingDurationHandler(
            mockSharedPreferences as SharedPreferences,
            mockDebuggingServiceImpl as DebuggingServiceImpl
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of debuggingDurationHandler', () => {
        expect(debuggingDurationHandler).toBeTruthy();
    });

    describe('handle', () => {
        jest.useFakeTimers();
        it('should disable debug', (done) => {
            const observer = {
                complete: jest.fn(),
                next: jest.fn()
            } as any;
            mockSharedPreferences.getString = jest.fn(() => of('2022-11-11'));
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            mockDebuggingServiceImpl.disableDebugging = jest.fn(() => of(true));
            debuggingDurationHandler.handle(observer).then(() => {
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith('debug_started_at');
                jest.advanceTimersByTime(1000 * 60);
                done();
            });
        });

        it('should not disable debug', (done) => {
            const observer = {
                complete: jest.fn(),
                next: jest.fn()
            } as any;
            mockSharedPreferences.getString = jest.fn(() => of(undefined));
            debuggingDurationHandler.handle(observer).then(() => {
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith('debug_started_at');
                jest.advanceTimersByTime(0);
                done();
            });
        });
    });
});
