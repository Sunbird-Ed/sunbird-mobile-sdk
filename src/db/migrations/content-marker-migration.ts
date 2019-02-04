import {DbService, Migration} from '..';
import {EventPriorityEntry, TelemetryEntry, TelemetryProcessedEntry, TelemetryTagEntry} from '../../telemetry/db/schema';
import {ImportedMetadataEntry, ProfileEntry, UserEntry} from '../../profile/db/schema';
import {PartnerEntry} from '../../partner/db/schema';
import {ContentEntry, ContentMarkerEntry} from '../../content/db/schema';

export class ContentMarkerMigration extends Migration {

    constructor() {
        super(5, 20);
    }

    apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query);
        });
    }

    queries(): Array<string> {
        return [
            ContentMarkerEntry.getCreateEntry()
        ];
    }


}
