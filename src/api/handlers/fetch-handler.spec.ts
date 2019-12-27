import {FetchHandler} from './fetch-handler';
import {of} from 'rxjs';
import {ApiConfig, HttpRequestType, Request, Response} from '..';
import {BaseConnection} from '../impl/base-connection';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {Authenticator} from '../def/authenticator';
import {HttpClientBrowser} from '../impl/http-client-browser';
import {HttpClientCordova} from '../impl/http-client-cordova';
import {SdkConfig} from '../../sdk-config';

jest.mock('../impl/base-connection');

describe('FetchHandler', () => {
    let fetchHandler: FetchHandler;
    const mockRequest: Request = (new Request.Builder())
        .withPath('/')
        .withType(HttpRequestType.GET)
        .build();
    const mockSdkConfig: Partial<SdkConfig> = {
        platform: 'web',
        apiConfig: {} as Partial<ApiConfig> as ApiConfig
    };
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockDefaultApiAuthenticators: Authenticator[] = [];
    const mockDefaultSessionAuthenticators: Authenticator[] = [];

    beforeAll(() => {
        fetchHandler = new FetchHandler(
            mockRequest as Request,
            mockSdkConfig as SdkConfig,
            mockDeviceInfo as DeviceInfo,
            mockSharedPreferences as SharedPreferences,
            mockDefaultApiAuthenticators,
            mockDefaultSessionAuthenticators
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (BaseConnection as jest.Mock<BaseConnection>).mockClear();
    });

    describe('constructor', () => {
        it('should construct baseConnection with axios client for platform web', () => {
            // arrange
            const mockBaseConnection: Partial<BaseConnection> = {
                invoke: jest.fn(() => of(new Response()))
            };
            (BaseConnection as jest.Mock<BaseConnection>).mockImplementation(() => {
                return mockBaseConnection;
            });
            fetchHandler = new FetchHandler(
                mockRequest as Request,
                mockSdkConfig as SdkConfig,
                mockDeviceInfo as DeviceInfo,
                mockSharedPreferences as SharedPreferences,
                mockDefaultApiAuthenticators,
                mockDefaultSessionAuthenticators
            );

            // assert
            expect(BaseConnection).toHaveBeenCalledWith(
                expect.any(HttpClientBrowser),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
        });

        it('should construct baseConnection with Cordova client for platform cordova', () => {
            // arrange
            mockSdkConfig.platform = 'cordova';
            const mockBaseConnection: Partial<BaseConnection> = {
                invoke: jest.fn(() => of(new Response()))
            };
            (BaseConnection as jest.Mock<BaseConnection>).mockImplementation(() => {
                return mockBaseConnection;
            });
            fetchHandler = new FetchHandler(
                mockRequest as Request,
                mockSdkConfig as SdkConfig,
                mockDeviceInfo as DeviceInfo,
                mockSharedPreferences as SharedPreferences,
                mockDefaultApiAuthenticators,
                mockDefaultSessionAuthenticators
            );

            // assert
            expect(BaseConnection).toHaveBeenCalledWith(
                expect.any(HttpClientCordova),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
        });
    });


    it('should delegate to baseConnection.invoke() on doFetch()', (done) => {
        // arrange
        mockSdkConfig.platform = 'cordova';
        const mockBaseConnection: Partial<BaseConnection> = {
            invoke: jest.fn(() => of(new Response()))
        };
        (BaseConnection as jest.Mock<BaseConnection>).mockImplementation(() => {
            return mockBaseConnection;
        });
        fetchHandler = new FetchHandler(
            mockRequest as Request,
            mockSdkConfig as SdkConfig,
            mockDeviceInfo as DeviceInfo,
            mockSharedPreferences as SharedPreferences,
            mockDefaultApiAuthenticators,
            mockDefaultSessionAuthenticators
        );

        // act
        fetchHandler.doFetch().subscribe(() => {
            // assert
            expect(mockBaseConnection.invoke).toHaveBeenCalledWith(mockRequest);

            done();
        });
    });
});
