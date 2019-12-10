import {Container} from 'inversify';
import {NetworkInfoService, NetworkStatus} from '..';
import {InjectionTokens} from '../../../injection-tokens';
import {NetworkInfoServiceImpl} from './network-info-service-impl';
import {take, toArray} from 'rxjs/operators';

describe.only('NetworkInfoServiceImpl', () => {
    let networkInfoService: NetworkInfoService;

    beforeAll(() => {
        window['Connection'] = {
            CELL: 'cellular',
            CELL_2G: '2g',
            CELL_3G: '3g',
            CELL_4G: '4g',
            ETHERNET: 'ethernet',
            NONE: 'none',
            UNKNOWN: 'unknown',
            WIFI: 'wifi'
        };

        window['navigator']['connection'] = { type: 'none'};

        const container = new Container();

        container.bind<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE).to(NetworkInfoServiceImpl);

        networkInfoService = container.get<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return instance from the container', () => {
        window['navigator']['connection'] = { type: 'none'};
        const container = new Container();
        container.bind<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE).to(NetworkInfoServiceImpl);
        networkInfoService = container.get<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE);

        expect(networkInfoService).toBeTruthy();
    });

    describe('networkStatus$', () => {
        it('should resolve to give default connection type "offline"', (done) => {
            // arrange
            window['navigator']['connection'] = { type: '3g'};
            const container = new Container();
            container.bind<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE).to(NetworkInfoServiceImpl);
            networkInfoService = container.get<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE);

            // act
            networkInfoService.networkStatus$.pipe(
                take(1)
            ).subscribe((value) => {
                expect(value).toBe(NetworkStatus.ONLINE);
                done();
            });
        });

        it('should resolve to give default connection type "online"', (done) => {
            // arrange
            window['navigator']['connection'] = { type: 'none'};
            const container = new Container();
            container.bind<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE).to(NetworkInfoServiceImpl);
            networkInfoService = container.get<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE);

            // act
            networkInfoService.networkStatus$.pipe(
                take(1)
            ).subscribe((value) => {
                expect(value).toBe(NetworkStatus.OFFLINE);
                done();
            });
        });

        it('should resolve to give connection type when changed', (done) => {
            // arrange
            window['navigator']['connection'] = { type: 'none'};
            const container = new Container();
            container.bind<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE).to(NetworkInfoServiceImpl);
            networkInfoService = container.get<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE);

            // act
            networkInfoService.networkStatus$.pipe(
                take(3),
                toArray()
            ).subscribe((value) => {
                // assert
                expect(value).toStrictEqual(
                    expect.arrayContaining([
                        NetworkStatus.OFFLINE,
                        NetworkStatus.ONLINE,
                        NetworkStatus.OFFLINE
                    ])
                );
                done();
            });

            window.dispatchEvent(new Event('online'));
            window.dispatchEvent(new Event('offline'));
        });
    });
});
