import {SunbirdSdk} from '../sdk';
import {SummarizerService, TelemetryService} from '..';

export class AssesmentAnalyzer {
    public static get analyze(): SummarizerService {
        return SunbirdSdk.instance.summarizerService;
    }
}
