import {FetchHandler} from './fetch-handler';
import {of} from 'rxjs';
import {ApiConfig, HttpRequestType, Request, Response} from '..';
import {BaseConnection} from '../impl/base-connection';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {Authenticator} from '../def/authenticator';
import {HttpClientAxios} from '../impl/http-client-axios';
import {HttpClientImpl} from '../impl/http-client-impl';

jest.mock('../impl/base-connection');

describe('FetchHandler', () => {
    let fetchHandler: FetchHandler;
    const mockRequest: Request = (new Request.Builder())
        .withPath('/')
        .withType(HttpRequestType.GET)
        .build();
    const mockApiConfig: Partial<ApiConfig> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockDefaultApiAuthenticators: Authenticator[] = [];
    const mockDefaultSessionAuthenticators: Authenticator[] = [];

    beforeAll(() => {
        fetchHandler = new FetchHandler(
            mockRequest as Request,
            mockApiConfig as ApiConfig,
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
        it('should construct baseConnection with axios client for DebugMode true', () => {
            // arrange
            const mockApiConfigWithApiDebugMode: Partial<ApiConfig> = {debugMode: true};
            const mockBaseConnection: Partial<BaseConnection> = {
                invoke: jest.fn(() => of(new Response()))
            };
            (BaseConnection as jest.Mock<BaseConnection>).mockImplementation(() => {
                return mockBaseConnection;
            });
            fetchHandler = new FetchHandler(
                mockRequest as Request,
                mockApiConfigWithApiDebugMode as ApiConfig,
                mockDeviceInfo as DeviceInfo,
                mockSharedPreferences as SharedPreferences,
                mockDefaultApiAuthenticators,
                mockDefaultSessionAuthenticators
            );

            // assert
            expect(BaseConnection).toHaveBeenCalledWith(
                expect.any(HttpClientAxios),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
        });

        it('should construct baseConnection with Cordova client for DebugMode false', () => {
            // arrange
            const mockApiConfigWithApiDebugMode: Partial<ApiConfig> = {debugMode: false};
            const mockBaseConnection: Partial<BaseConnection> = {
                invoke: jest.fn(() => of(new Response()))
            };
            (BaseConnection as jest.Mock<BaseConnection>).mockImplementation(() => {
                return mockBaseConnection;
            });
            fetchHandler = new FetchHandler(
                mockRequest as Request,
                mockApiConfigWithApiDebugMode as ApiConfig,
                mockDeviceInfo as DeviceInfo,
                mockSharedPreferences as SharedPreferences,
                mockDefaultApiAuthenticators,
                mockDefaultSessionAuthenticators
            );

            // assert
            expect(BaseConnection).toHaveBeenCalledWith(
                expect.any(HttpClientImpl),
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
        const mockBaseConnection: Partial<BaseConnection> = {
            invoke: jest.fn(() => of(new Response()))
        };
        (BaseConnection as jest.Mock<BaseConnection>).mockImplementation(() => {
            return mockBaseConnection;
        });
        fetchHandler = new FetchHandler(
            mockRequest as Request,
            mockApiConfig as ApiConfig,
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
