import {Observable} from 'rxjs';
import {EnvironmentConfigProvider} from './environment-config-provider';

export class AndroidConfigProvider implements EnvironmentConfigProvider {
    provide(): Observable<{ [p: string]: string }> {
        return Observable.fromPromise(new Promise<string>((resolve, reject) => {
            buildconfigreader.getBuildConfigValues('org.sunbird.app', (v) => {
                resolve(v);
            }, (err) => {
                reject(err);
            });
        })).map((v) => JSON.parse(v));
    }
}
