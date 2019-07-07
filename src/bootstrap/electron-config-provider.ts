import {Observable, Observer} from 'rxjs';
import {EnvironmentConfigProvider} from './environment-config-provider';
import {BootstrapConfig} from './bootstrap-config';

export class ElectronConfigProvider implements EnvironmentConfigProvider {
    provide(bootstrapConfig: BootstrapConfig): Observable<{ [p: string]: string }> {
        return Observable.create((observer: Observer<string>) => {
            window['require']('fs').readFile(
                bootstrapConfig.rootDir + '/build-config-values.json', 'utf-8',
                (err, data) => {
                    if (err) {
                        observer.error(err);
                        return;
                    }

                    observer.next(JSON.parse(data));
                    observer.complete();
                });
        });
    }
}
