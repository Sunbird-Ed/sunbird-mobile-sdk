import { CodePushExperimentService } from '..';
import { Observable } from 'rxjs';
import {SharedPreferences} from '../../util/shared-preferences';
import { inject, injectable } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { CodePushExperiment } from '../../preference-keys';
import { tap } from 'rxjs/operators';

@injectable()
export class CodePUshExperimentServiceImpl implements CodePushExperimentService {
    experimentKey: string | undefined;

    constructor(
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences
    ) {}

    setDefaultDeploymentKey(deploymentKey: string): Observable<void> {
        return this.sharedPreferences.putString(CodePushExperiment.DEFAULT_DEPLOYMENT_KEY, deploymentKey);
    }

    getDefaultDeploymentKey(): Observable<string | undefined> {
        return this.sharedPreferences.getString(CodePushExperiment.DEFAULT_DEPLOYMENT_KEY);
    }

    setExperimentKey(experimentKey: string): Observable<void> {
        return this.sharedPreferences.putString(CodePushExperiment.EXPERIMENT_KEY, experimentKey).pipe(
            tap(() => {
                if (!this.experimentKey) {
                    this.experimentKey = experimentKey;
                }
            })
        );
    }

    getExperimentKey(): string | Observable<string | undefined> {
        if (!this.experimentKey) {
            return this.sharedPreferences.getString(CodePushExperiment.EXPERIMENT_KEY).pipe(
                tap(key => {
                    this.experimentKey = key;
                    return key;
                })
            );
        } else {
            return this.experimentKey;
        }
    }

    setExperimentAppVersion(appVersion: string): Observable<void> {
        return this.sharedPreferences.putString(CodePushExperiment.EXPERIMENT_APP_VERSION, appVersion);
    }

    getExperimentAppVersion(): Observable<string | undefined> {
        return this.sharedPreferences.getString(CodePushExperiment.EXPERIMENT_APP_VERSION);
    }


}
