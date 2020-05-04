import { TelemetryServiceImpl } from './telemetry-service-impl';
import { ApiService } from '../../api';
import { FileService } from '../../util/file/def/file-service';
import { CachedItemStore, KeyValueStore } from '../../key-value-store';
import { SdkConfig } from '../../sdk-config';
import { Container, inject } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { of, throwError } from 'rxjs';
import { TelemetryDecorator, TelemetryService } from '..';
import { DbService } from '../../db';
import { ProfileService } from '../../profile';
import { GroupService } from '../../group';
import { DeviceInfo } from '../../util/device';
import { EventsBusService } from '../../events-bus';
import { FrameworkService } from '../../framework';
import { NetworkInfoService } from '../../util/network';
import { ErrorLoggerService } from '../../error';
import { SharedPreferences } from '../../util/shared-preferences';
import { AppInfo } from '../../util/app';
import { DeviceRegisterService } from '../../device-register';
import { CourseService } from '../../course';
import { mockSdkConfigWithtelemetryServiceConfig } from './telemetry-service-impl.spec.data';
import { anything } from 'ts-mockito';
import { TelemetryKeys } from '../../preference-keys';

declare const sbutility;


describe('TelemetryServiceImpl', () => {
  let telemetryService: TelemetryService;

  const container = new Container();

  const mockDbService: Partial<DbService> = {};
  const mockTelemetryDecorator: Partial<TelemetryDecorator> = {};
  const mockProfileService: Partial<ProfileService> = {};
  const mockGroupService: Partial<GroupService> = {};
  const mockKeyValueStore: Partial<KeyValueStore> = {};
  const mockApiService: Partial<ApiService> = {};
  const mockSdkConfig: Partial<SdkConfig> = {};
  const mockDeviceInfo: Partial<DeviceInfo> = {};
  const mockEventsBusService: Partial<EventsBusService> = {};
  const mockFileService: Partial<FileService> = {};
  const mockFrameworkService: Partial<FrameworkService> = {};
  const mockNetworkInfoService: Partial<NetworkInfoService> = {};
  const mockErrorLoggerService: Partial<ErrorLoggerService> = {};
  const mockSharedPreferences: Partial<SharedPreferences> = {};
  const mockAppInfo: Partial<AppInfo> = {};
  const mockDeviceRegisterService: Partial<DeviceRegisterService> = {};
  const mockCourseService: Partial<CourseService> = {};


  beforeAll(() => {
    container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).to(TelemetryServiceImpl);
    container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
    container.bind<TelemetryDecorator>(InjectionTokens.TELEMETRY_DECORATOR).toConstantValue(mockTelemetryDecorator as TelemetryDecorator);
    container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(mockProfileService as ProfileService);
    container.bind<GroupService>(InjectionTokens.GROUP_SERVICE).toConstantValue(mockGroupService as GroupService);
    container.bind<KeyValueStore>(InjectionTokens.KEY_VALUE_STORE).toConstantValue(mockKeyValueStore as KeyValueStore);
    container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
    container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfigWithtelemetryServiceConfig as SdkConfig);
    container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).toConstantValue(mockDeviceInfo as DeviceInfo);
    container.bind<EventsBusService>(InjectionTokens.EVENTS_BUS_SERVICE).toConstantValue(mockEventsBusService as EventsBusService);
    container.bind<FileService>(InjectionTokens.FILE_SERVICE).toConstantValue(mockFileService as FileService);
    container.bind<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE).toConstantValue(mockFrameworkService as FrameworkService);
    container.bind<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE).toConstantValue(mockNetworkInfoService as NetworkInfoService);
    container.bind<ErrorLoggerService>(InjectionTokens.ERROR_LOGGER_SERVICE).toConstantValue(mockErrorLoggerService as ErrorLoggerService);
    container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);
    container.bind<AppInfo>(InjectionTokens.APP_INFO).toConstantValue(mockAppInfo as AppInfo);
    container.bind<DeviceRegisterService>(InjectionTokens.DEVICE_REGISTER_SERVICE).toConstantValue(mockDeviceRegisterService as DeviceRegisterService);
    container.bind<CourseService>(InjectionTokens.COURSE_SERVICE).toConstantValue(mockCourseService as CourseService);

    telemetryService = container.get<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return instance from the container', () => {
    expect(telemetryService).toBeTruthy();
  });

  describe('feedback', () => {
    it('should generate proper FEEDBACK telemetry', (done) => {
      // arrange
      // @ts-ignore
      const decorateMock = jest.spyOn(telemetryService, 'decorateAndPersist').mockReturnValue(of(true));
      // act
      // assert
      telemetryService.feedback({
        rating: 5,
        comments: 'Nice Content',
        env: 'home',
        objId: 'do_123',
        objType: 'Resource',
        objVer: '2',
        commentid: 'NICE_CONTENT',
        commenttxt: 'Nice Content'
      }).subscribe(() => {
        // assert
        // @ts-ignore
        expect(decorateMock.mock.calls[0][0]['edata']).toEqual({
          commentid: 'NICE_CONTENT',
          commenttxt: 'Nice Content',
          comments: 'Nice Content',
          rating: 5
        });
        expect(decorateMock.mock.calls[0][0]['context']['env']).toEqual('home');
        expect(decorateMock.mock.calls[0][0]['object']).toEqual({
          id: 'do_123',
          rollup: {},
          type: 'Resource',
          version: '2'
        });
        done();
      });
    });

    it('should generate proper FEEDBACK telemetry for empty values', (done) => {
      // arrange
      // @ts-ignore
      const decorateMock = jest.spyOn(telemetryService, 'decorateAndPersist').mockReturnValue(of(true));
      // act
      // assert
      telemetryService.feedback({
        env: 'home',
        objId: 'do_123',
        objType: 'Resource',
        objVer: '2',
      } as any).subscribe(() => {
        // assert
        // @ts-ignore
        expect(decorateMock.mock.calls[0][0]['edata']).toEqual({
        });
        expect(decorateMock.mock.calls[0][0]['context']['env']).toEqual('home');
        expect(decorateMock.mock.calls[0][0]['object']).toEqual({
          id: 'do_123',
          rollup: {},
          type: 'Resource',
          version: '2'
        });
        done();
      });
    });
  });

  describe('preInit()', () => {
    it('should fetch all utm parameters and clear utm parameters', (done) => {
      sbutility.getUtmInfo = jest.fn((a, b) => a({ val: [{ utmSource: 'google-play' }] }));
      telemetryService.preInit().subscribe(() => {
        expect(sbutility.getUtmInfo).toHaveBeenCalled();
        done();
      });
    });

    it('should fetch all utm parameters and can not clear utm parameters', (done) => {
      sbutility.getUtmInfo = jest.fn((a, b) => a({ val: [{ utmSource: 'google-play' }] }));
      telemetryService.preInit().subscribe(() => {
        expect(sbutility.getUtmInfo).toHaveBeenCalled();
        done();
      });
    });

    it('should not fetch all utm parameters if parameter is undefined', (done) => {
      sbutility.getUtmInfo = jest.fn((a, b) => a({ val: undefined}));
      telemetryService.preInit().subscribe(() => {
        expect(sbutility.getUtmInfo).toHaveBeenCalled();
        done();
      });
    });

    it('will be getUtmInfo error par', (done) => {
      sbutility.getUtmInfo = jest.fn((a, b) => b({error: 'errpr-part'}));
      sbutility.clearUtmInfo = jest.fn((a, b) => a());
      telemetryService.preInit().subscribe(() => {
        expect(sbutility.getUtmInfo).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('onInit', () => {
    it('should return lastSyncTimestamp', (done) => {
      mockSharedPreferences.getString = jest.fn(() => of('sample-last-sync-time'));
      telemetryService.onInit().subscribe(() => {
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith(TelemetryKeys.KEY_LAST_SYNCED_TIME_STAMP);
        done();
      });
    });

    it('should not return lastSyncTimestamp if undefined', (done) => {
      mockSharedPreferences.getString = jest.fn(() => of(undefined));
      telemetryService.onInit().subscribe(() => {
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith(TelemetryKeys.KEY_LAST_SYNCED_TIME_STAMP);
        done();
      });
    });

    it('should not return lastSyncTimestamp if undefined', (done) => {
      mockSharedPreferences.getString = jest.fn(() => throwError({error: 'error-part'}));
      telemetryService.onInit().toPromise().catch((e) => {
        expect(e.error).toBe('error-part');
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith(TelemetryKeys.KEY_LAST_SYNCED_TIME_STAMP);
        done();
      });
    });
  });
});
