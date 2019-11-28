import { CodePushExperimentService } from '..';
import { Observable } from 'rxjs';
import { SharedPreferences } from '../../util/shared-preferences';
export declare class CodePUshExperimentServiceImpl implements CodePushExperimentService {
    private sharedPreferences;
    experimentKey: string | undefined;
    constructor(sharedPreferences: SharedPreferences);
    setDefaultDeploymentKey(deploymentKey: string): Observable<void>;
    getDefaultDeploymentKey(): Observable<string | undefined>;
    setExperimentKey(experimentKey: string): Observable<void>;
    getExperimentKey(): string | Observable<string | undefined>;
    setExperimentAppVersion(appVersion: string): Observable<void>;
    getExperimentAppVersion(): Observable<string | undefined>;
}
