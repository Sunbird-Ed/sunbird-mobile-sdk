import { TelemetryServiceImpl } from './telemetry-service-impl';
import { ApiService } from '../../api';
import { FileService } from '../../util/file/def/file-service';
import { KeyValueStore } from '../../key-value-store';
import { SdkConfig } from '../../sdk-config';
import { Container } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { of, throwError } from 'rxjs';
import {
  TelemetryDecorator, TelemetryService, TelemetryAuditRequest,
  Actor, AuditState, CorrelationData, Rollup, TelemetryEndRequest,
  TelemetryErrorRequest, TelemetryImpressionRequest, TelemetryInteractRequest,
  TelemetryLogRequest, TelemetryShareRequest, TelemetryStartRequest, DeviceSpecification,
  TelemetryInterruptRequest, TelemetryImportRequest, TelemetrySyncRequest, TelemetrySummaryRequest
} from '..';
import { DbService } from '../../db';
import { ProfileService } from '../../profile';
import { GroupServiceDeprecated } from '../../group-deprecated';
import { DeviceInfo } from '../../util/device';
import { EventsBusService } from '../../events-bus';
import { FrameworkService } from '../../framework';
import { NetworkInfoService, NetworkStatus } from '../../util/network';
import { ErrorLoggerService } from '../../error';
import { SharedPreferences } from '../../util/shared-preferences';
import { AppInfo } from '../../util/app';
import { DeviceRegisterService } from '../../device-register';
import { CourseService } from '../../course';
import { mockSdkConfigWithtelemetryServiceConfig } from './telemetry-service-impl.spec.data';
import { NetworkQueue } from '../../api/network-queue';
import { TelemetryKeys } from '../../preference-keys';
import { doesIntersect } from 'tslint';
import { InteractType, LogType, LogLevel } from '../def/telemetry-constants';
import { ValidateTelemetryMetadata } from '../handler/import/validate-telemetry-metadata';
import { TransportProcessedTelemetry } from '../handler/import/transport-processed-telemetry';
import { UpdateImportedTelemetryMetadata } from '../handler/import/update-imported-telemetry-metadata';
import { GenerateImportTelemetryShare } from '../handler/import/generate-import-telemetry-share';
import { TelemetrySyncHandler } from '../handler/telemetry-sync-handler';

jest.mock('../handler/import/validate-telemetry-metadata');
jest.mock('../handler/import/transport-processed-telemetry');
jest.mock('../handler/import/update-imported-telemetry-metadata');
jest.mock('../handler/import/generate-import-telemetry-share');
jest.mock('../handler/telemetry-sync-handler');
declare const sbutility;


describe('TelemetryServiceImpl', () => {
  let telemetryService: TelemetryService;

  const container = new Container();

  const mockDbService: Partial<DbService> = {};
  const mockTelemetryDecorator: Partial<TelemetryDecorator> = {};
  const mockProfileService: Partial<ProfileService> = {};
  const mockGroupService: Partial<GroupServiceDeprecated> = {};
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
  const mockNetworkQueue: Partial<NetworkQueue> = {};


  beforeAll(() => {
    container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).to(TelemetryServiceImpl);
    container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
    container.bind<TelemetryDecorator>(InjectionTokens.TELEMETRY_DECORATOR).toConstantValue(mockTelemetryDecorator as TelemetryDecorator);
    container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(mockProfileService as ProfileService);
    container.bind<GroupServiceDeprecated>(InjectionTokens.GROUP_SERVICE_DEPRECATED).toConstantValue(mockGroupService as GroupServiceDeprecated);
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
    container.bind<NetworkQueue>(InjectionTokens.NETWORK_QUEUE).toConstantValue(mockNetworkQueue as NetworkQueue);

    telemetryService = container.get<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    (ValidateTelemetryMetadata as jest.Mock<ValidateTelemetryMetadata>).mockClear();
    (TransportProcessedTelemetry as jest.Mock<TransportProcessedTelemetry>).mockClear();
    (UpdateImportedTelemetryMetadata as jest.Mock<UpdateImportedTelemetryMetadata>).mockClear();
    (GenerateImportTelemetryShare as jest.Mock<GenerateImportTelemetryShare>).mockClear();
    (TelemetrySyncHandler as any as jest.Mock<TelemetrySyncHandler>).mockClear();
  });

  it('should return instance from the container', () => {
    expect(telemetryService).toBeTruthy();
  });

  it('should return telemetry auto sync service', () => {
    expect(telemetryService.autoSync).toBeTruthy();
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
        // expect(decorateMock.mock.calls[0][0]['context']['env']).toEqual('home');
        // expect(decorateMock.mock.calls[0][0]['object']).toEqual({
        //   id: 'do_123',
        //   rollup: {},
        //   type: 'Resource',
        //   version: '2'
        // });
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
        // expect(decorateMock.mock.calls[0][0]['context']['env']).toEqual('home');
        // expect(decorateMock.mock.calls[0][0]['object']).toEqual({
        //   id: 'do_123',
        //   rollup: {},
        //   type: 'Resource',
        //   version: '2'
        // });
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
      sbutility.getUtmInfo = jest.fn((a, b) => a({ val: undefined }));
      telemetryService.preInit().subscribe(() => {
        expect(sbutility.getUtmInfo).toHaveBeenCalled();
        done();
      });
    });

    it('will be getUtmInfo error par', (done) => {
      sbutility.getUtmInfo = jest.fn((a, b) => b({ error: 'errpr-part' }));
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
      sbsync.onAuthorizationError = jest.fn((success, error) => {
        success({ network_queue_error: 'Unauthorized' });
      });
      telemetryService.onInit().subscribe(() => {
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith(TelemetryKeys.KEY_LAST_SYNCED_TIME_STAMP);
        done();
      });
    });

    it('should not return lastSyncTimestamp if undefined', (done) => {
      mockSharedPreferences.getString = jest.fn(() => of(undefined));
      sbsync.onAuthorizationError = jest.fn((success, error) => {
        success({ network_queue_error: 'Unauthorized' });
      });
      telemetryService.onInit().subscribe(() => {
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith(TelemetryKeys.KEY_LAST_SYNCED_TIME_STAMP);
        done();
      });
    });

    it('should not return lastSyncTimestamp if undefined', (done) => {
      mockSharedPreferences.getString = jest.fn(() => throwError({ error: 'error-part' }));
      sbsync.onAuthorizationError = jest.fn((success, error) => {
        success({ network_queue_error: 'Unauthorized' });
      });
      telemetryService.onInit().toPromise().catch((e) => {
        expect(e.error).toBe('error-part');
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith(TelemetryKeys.KEY_LAST_SYNCED_TIME_STAMP);
        done();
      });
    });
  });

  describe('saveTelemetry', () => {
    it('should return save telemetry', (done) => {
      const request = '{"event": "save"}';
      mockProfileService.getActiveProfileSession = jest.fn(() => of({
        uid: 'sample-uid',
        sid: 'sample-sid',
        createdTime: Date.now(),
      }));
      mockGroupService.getActiveGroupSession = jest.fn(() => of({
        gid: 'sample-gid',
        sid: 'sample-sid',
        createdTime: Date.now(),
      })) as any;
      mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
      mockTelemetryDecorator.decorate = jest.fn(() => { });
      mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
      mockDbService.insert = jest.fn(() => of(1));
      mockEventsBusService.emit = jest.fn();
      telemetryService.saveTelemetry(request).subscribe(() => {
        expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
        expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
        expect(mockKeyValueStore.getValue).toHaveBeenCalled();
        expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
        expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
        expect(mockDbService.insert).toHaveBeenCalled();
        expect(mockEventsBusService.emit).toHaveBeenCalled();
        done();
      }, (e) => {
        done();
      });
    });

    it('should not return save telemetry for catch part', (done) => {
      const request = '';
      telemetryService.saveTelemetry(request).subscribe((e) => {
        expect(e).toBeFalsy();
        done();
      });
    });
  });

  it('should return audit event', (done) => {
    const cData: Array<CorrelationData> = [];
    const request: TelemetryAuditRequest = {
      env: 'home',
      actor: Actor.TYPE_USER,
      currentState: AuditState.AUDIT_CREATED,
      updatedProperties: ['update'],
      type: 'sample-type',
      objId: 'sample-obj-id',
      objType: 'sample-obj-type',
      objVer: 'sample-obj-ver',
      correlationData: cData.push({ id: 'sample-id', type: 'sample-type' }),
      rollUp: { l1: 'root-id' }

    } as any;
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.audit(request).subscribe(() => {
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });

  it('should return End event', (done) => {
    const cData: Array<CorrelationData> = [];
    const request: TelemetryEndRequest = {
      env: 'home',
      type: 'sample-type',
      mode: 'sample-mode',
      duration: 1,
      pageId: 'sample-page',
      objId: 'sample-obj-id',
      objType: 'sample-obj-type',
      objVer: 'sample-obj-ver',
      rollup: { l1: 'd0-123' },
      summaryList: [{ 'id': 'do-123' }],
      correlationData: cData.push({ id: 'sample-id', type: 'sample-type' })
    } as any;
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.end(request).subscribe(() => {
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });

  it('should return error event', (done) => {
    const cData: Array<CorrelationData> = [];
    const request: TelemetryErrorRequest = {
      errorCode: 'sample-error-code',
      errorType: 'sample-error-type',
      stacktrace: 'sample-stack-trace',
      pageId: 'sample-page-id'
    } as any;
    mockErrorLoggerService.logError = jest.fn(() => throwError({ error: 'error' }));
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.error(request).subscribe(() => {
      expect(mockErrorLoggerService.logError).toHaveBeenCalledWith(request);
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });

  it('should return impression event', (done) => {
    const cData: Array<CorrelationData> = [];
    const request: TelemetryImpressionRequest = {
      env: 'home',
      type: 'sample-type',
      mode: 'sample-mode',
      pageId: 'sample-page',
      objId: 'sample-obj-id',
      objType: 'sample-obj-type',
      objVer: 'sample-obj-ver',
      rollup: { l1: 'd0-123' },
      visits: [{
        objid: 'visit-obj-id',
        objtype: 'visit-obj-type',
        objver: 'visit-obj-ver',
        section: 'visit-section',
        index: 0
      }],
      correlationData: cData.push({ id: 'sample-id', type: 'sample-type' })
    } as any;
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.impression(request).subscribe(() => {
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });

  it('should return interact event', (done) => {
    const cData: Array<CorrelationData> = [];
    const request: TelemetryInteractRequest = {
      env: 'home',
      type: InteractType.TOUCH,
      subType: 'sample-sub-type',
      mode: 'sample-mode',
      id: 'sample-id',
      pageId: 'sample-page',
      objId: 'sample-obj-id',
      objType: 'sample-obj-type',
      objVer: 'sample-obj-ver',
      rollup: { l1: 'd0-123' },
      pos: [{ 'id': 'id' }],
      correlationData: cData.push({ id: 'sample-id', type: 'sample-type' })
    } as any;
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.interact(request).subscribe(() => {
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });

  it('should return log telemetry', (done) => {
    const cData: Array<CorrelationData> = [];
    const request: TelemetryLogRequest = {
      type: LogType.NOTIFICATION,
      level: LogLevel.DEBUG,
      message: 'sample-msg',
      pageId: 'sample-page-id',
      params: [{ 'id': 'sample-id' }],
      env: 'home',
      actorType: 'sample-actor-type'
    };
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.log(request).subscribe(() => {
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });

  it('should return share telemetry', (done) => {
    const cData: Array<CorrelationData> = [];
    cData.push({ id: 'data', type: 'share' });
    const request: TelemetryShareRequest = {
      dir: 'share-dir',
      type: 'sample-type',
      items: [{
        type: 'Share-Item-Type',
        origin: 'sample-origin',
        identifier: 'do-123',
        pkgVersion: 1,
        transferCount: 1,
        size: '16kb'
      }],
      env: 'home',
      correlationData: cData,
      objId: 'sample-obj-id',
      objType: 'sample-obj-type',
      objVer: 'sample-obj-ver',
      rollUp: { l1: 'root-id' }
    };
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.share(request).subscribe(() => {
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });

  it('should return start telemetry', (done) => {
    const cData: Array<CorrelationData> = [];
    cData.push({ id: 'data', type: 'share' });
    const request: TelemetryStartRequest = {
      type: 'sample-type',
      deviceSpecification: { os: '' } as any,
      loc: 'sample-loc',
      mode: 'sample-mode',
      duration: 12,
      pageId: 'sample-page-id',
      env: 'home',
      objId: 'sample-obj-id',
      objType: 'sample-obj-type',
      objVer: 'sample-obj-ver',
      rollup: { l1: 'root-id' },
      correlationData: cData
    };
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.start(request).subscribe(() => {
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });

  it('should return summaryTelemetry telemetry', (done) => {
    const cData: Array<CorrelationData> = [];
    cData.push({ id: 'data', type: 'share' });
    const request: TelemetrySummaryRequest = {
      type: 'sample-type',
      starttime: 123,
      endtime: 456,
      timespent: 789,
      pageviews: 3,
      interactions: 42,
      mode: 'sample-mode',
      env: 'home',
      objId: 'sample-obj-id',
      objType: 'sample-obj-type',
      objVer: 'sample-obj-ver',
      rollup: { l1: 'root-id' },
      correlationData: cData
    };
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.summary(request).subscribe(() => {
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });


  it('should return interrupt telemetry', (done) => {
    const request: TelemetryInterruptRequest = {
      type: 'sample-type',
      pageId: 'sample-page-id'
    };
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    }));
    mockGroupService.getActiveGroupSession = jest.fn(() => of({
      gid: 'sample-gid',
      sid: 'sample-sid',
      createdTime: Date.now(),
    })) as any;
    mockKeyValueStore.getValue = jest.fn(() => of('sampe-key-value'));
    mockTelemetryDecorator.decorate = jest.fn(() => { });
    mockTelemetryDecorator.prepare = jest.fn(() => { }) as any;
    mockDbService.insert = jest.fn(() => of(1));
    mockEventsBusService.emit = jest.fn();
    // act
    telemetryService.interrupt(request).subscribe(() => {
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      expect(mockTelemetryDecorator.decorate).toHaveBeenCalled();
      expect(mockTelemetryDecorator.prepare).toHaveBeenCalled();
      expect(mockDbService.insert).toHaveBeenCalled();
      expect(mockEventsBusService.emit).toHaveBeenCalled();
      done();
    });
  });

  it('should return importTelemetry telemetry', (done) => {
    const request: TelemetryImportRequest = {
      sourceFilePath: 'sample-source-file-path'
    };
    (ValidateTelemetryMetadata as jest.Mock<ValidateTelemetryMetadata>).mockImplementation(() => {
      return {
        execute: jest.fn(() => Promise.resolve({ body: { message: 'message', export_id: 'sample-id' } }))
      } as any;
    });
    (TransportProcessedTelemetry as jest.Mock<TransportProcessedTelemetry>).mockImplementation(() => {
      return {
        execute: jest.fn(() => Promise.resolve({ body: { message: 'message', export_id: 'sample-id' } }))
      } as any;
    });
    (UpdateImportedTelemetryMetadata as jest.Mock<UpdateImportedTelemetryMetadata>).mockImplementation(() => {
      return {
        execute: jest.fn(() => Promise.resolve({ body: { message: 'message', export_id: 'sample-id' } }))
      } as any;
    });
    (GenerateImportTelemetryShare as jest.Mock<GenerateImportTelemetryShare>).mockImplementation(() => {
      return {
        execute: jest.fn(() => Promise.resolve({ body: { message: 'message', export_id: 'sample-id' } }))
      } as any;
    });
    // act
    telemetryService.importTelemetry(request).subscribe((res) => {
      expect(res).toBeTruthy();
      done();
    });
  });

  it('should not return importTelemetry telemetry for catch part', (done) => {
    const request: TelemetryImportRequest = {
      sourceFilePath: 'sample-source-file-path'
    };
    (ValidateTelemetryMetadata as jest.Mock<ValidateTelemetryMetadata>).mockImplementation(() => {
      return {
        execute: jest.fn(() => Promise.reject({error: 'error'}))
      } as any;
    });
    // act
    telemetryService.importTelemetry(request).subscribe((e) => {
      expect(e).toBeFalsy();
      done();
    });
  });

  it('should return telemetry for last sync time', (done) => {
    mockDbService.execute = jest.fn(() => of([{
      'TELEMETRY_COUNT': 1,
    }, {
      'PROCESSED_TELEMETRY_COUNT': 2
    }]));
    mockKeyValueStore.getValue = jest.fn(() => of('sample-key-value'));
    // act
    telemetryService.getTelemetryStat().subscribe(() => {
      expect(mockDbService.execute).toHaveBeenCalled();
      expect(mockKeyValueStore.getValue).toHaveBeenCalled();
      done();
    }, (e) => {
      done();
    });
  });

  describe('sync', () => {
    it('should return sync telemetry for online', (done) => {
      // arrange
      const request: TelemetrySyncRequest = {
        ignoreSyncThreshold: false,
        ignoreAutoSyncMode: false
      };
      mockNetworkInfoService.networkStatus$ = of(NetworkStatus.ONLINE);
      (TelemetrySyncHandler as any as jest.Mock<TelemetrySyncHandler>).mockImplementation(() => {
        return {
          handle: jest.fn(() => of({
            syncedEventCount: 12,
            syncTime: 2,
            syncedFileSize: 24
          }))
        } as any;
      });
      mockSharedPreferences.putString = jest.fn(() => of(undefined));
      // act
      telemetryService.sync(request).subscribe(() => {
        expect(request.ignoreSyncThreshold).toBeTruthy();
        expect(mockNetworkInfoService.networkStatus$).not.toBeUndefined();
        expect(mockSharedPreferences.putString).toHaveBeenCalled();
        done();
      }, (e) => {
        done();
      });
    });

    it('should return sync telemetry for offline', (done) => {
      // arrange
      const request: TelemetrySyncRequest = {
        ignoreSyncThreshold: false,
        ignoreAutoSyncMode: false
      };
      mockNetworkInfoService.networkStatus$ = of(NetworkStatus.OFFLINE);
      (TelemetrySyncHandler as any as jest.Mock<TelemetrySyncHandler>).mockImplementation(() => {
        return {
          handle: jest.fn(() => of({
            syncedEventCount: 12,
            syncTime: 2,
            syncedFileSize: 24,
            error: 'erroe'
          }))
        } as any;
      });
      // act
      telemetryService.sync(request).subscribe(() => {
        expect(request.ignoreSyncThreshold).toBeFalsy();
        expect(mockNetworkInfoService.networkStatus$).not.toBeUndefined();
        done();
      }, (e) => {
        done();
      });
    });
  });

  it('should return resetDeviceRegisterTTL', (done) => {
    (TelemetrySyncHandler as any as jest.Mock<TelemetrySyncHandler>).mockImplementation(() => {
      return {
        resetDeviceRegisterTTL: jest.fn(() => of(undefined))
      } as any;
    });
    // act
    telemetryService.resetDeviceRegisterTTL().subscribe(() => {
      done();
    });
  });

  it('should return lastSyncedTimestamp', (done) => {
    telemetryService.lastSyncedTimestamp().subscribe(() => {
      done();
    });
  });

  it('should return build context', (done) => {
    mockProfileService.getActiveProfileSession = jest.fn(() => of({
      uid: 'sample-uid',
      sid: 'sample-sid',
      createdTime: 2
    }));
    mockTelemetryDecorator.buildContext = jest.fn(() => {}) as any;
    // act
    telemetryService.buildContext().subscribe(() => {
      expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
      expect(mockTelemetryDecorator.buildContext).toHaveBeenCalled();
      done();
    }) ;
  });
});
