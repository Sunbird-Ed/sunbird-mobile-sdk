import {Migration} from '../../db';
import {TelemetryEntry, TelemetryProcessedEntry} from './schema';

export class TelemetryMigration extends Migration {

    constructor() {
        super(1);
    }

    queries(): Array<string> {
        return [TelemetryEntry.getCreateEntry(), TelemetryProcessedEntry.getCreateEntry()];
    }

}
