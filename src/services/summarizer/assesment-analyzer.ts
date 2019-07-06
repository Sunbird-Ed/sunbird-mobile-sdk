import {SunbirdSdk} from '../../sdk';
import {SummarizerService} from '../../index';

export class AssesmentAnalyzer {
    public static get analyze(): SummarizerService {
        return SunbirdSdk.instance.summarizerService;
    }
}
