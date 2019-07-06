import {Observable} from 'rxjs';
import {EnvironmentConfigProvider} from './environment-config-provider';

export class ElectronConfigProvider implements EnvironmentConfigProvider {
    provide(): Observable<{ [p: string]: string }> {
        const fs = require('fs');
        return JSON.parse(fs.readFileSync('properties.json', 'utf-8'));
    }
}
