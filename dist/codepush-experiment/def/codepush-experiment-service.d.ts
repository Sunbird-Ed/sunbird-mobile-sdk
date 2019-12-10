import { Observable } from 'rxjs';
export interface CodePushExperimentService {
    setDefaultDeploymentKey(deploymentKey: string): Observable<void>;
    getDefaultDeploymentKey(): Observable<string | undefined>;
    setExperimentKey(experimentKey: string): Observable<void>;
    getExperimentKey(): string | Observable<string | undefined>;
    setExperimentAppVersion(appVersion: string): Observable<void>;
    getExperimentAppVersion(): Observable<string | undefined>;
}
