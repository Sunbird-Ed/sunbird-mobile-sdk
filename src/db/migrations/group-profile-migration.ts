import {DbService, Migration} from '..';
import {EventPriorityEntry, TelemetryEntry, TelemetryProcessedEntry, TelemetryTagEntry} from '../../telemetry/db/schema';
import {GroupEntry, GroupProfileEntry, ImportedMetadataEntry, ProfileEntry, UserEntry} from '../../profile/db/schema';
import {PartnerEntry} from '../../partner/db/schema';
import {ContentEntry} from '../../content/db/schema';

export class GroupProfileMigration extends Migration {

    constructor() {
        super(3, 18);
    }

    apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query);
        });
    }

    queries(): Array<string> {
        return [
            GroupProfileEntry.getCreateEntry(),
            GroupEntry.getCreateEntry()
        ];
    }

    private updateProfileTable() {

    }


}
