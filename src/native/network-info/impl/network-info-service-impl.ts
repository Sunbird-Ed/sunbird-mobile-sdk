import {NetworkInfoService, NetworkStatus} from '..';
import {BehaviorSubject, Observable} from 'rxjs';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {Environments, SdkConfig} from '../../..';

@injectable()
export class NetworkInfoServiceImpl implements NetworkInfoService {
    networkStatus$: Observable<NetworkStatus>;
    private networkStatusSource: BehaviorSubject<NetworkStatus>;

    constructor(@inject(InjectionTokens.SDK_CONFIG) sdkConfig: SdkConfig) {
        if (sdkConfig.environment === Environments.ANDROID) {
            if (navigator.connection.type === Connection.NONE) {
                this.networkStatusSource = new BehaviorSubject<NetworkStatus>(NetworkStatus.OFFLINE);
            } else {
                this.networkStatusSource = new BehaviorSubject<NetworkStatus>(NetworkStatus.ONLINE);
            }

            window.addEventListener('online', () => {
                this.networkStatusSource.next(NetworkStatus.ONLINE);
            }, false);

            window.addEventListener('offline', () => {
                this.networkStatusSource.next(NetworkStatus.OFFLINE);
            }, false);
        } else {
            this.networkStatusSource = new BehaviorSubject<NetworkStatus>(NetworkStatus.ONLINE);
        }

        this.networkStatus$ = this.networkStatusSource.asObservable();
    }
}
