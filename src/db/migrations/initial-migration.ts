import {DbService, Migration} from '..';
import {EventPriorityEntry, TelemetryEntry, TelemetryProcessedEntry, TelemetryTagEntry} from '../../telemetry/db/schema';
import {ImportedMetadataEntry, ProfileEntry, UserEntry, LearnerAssessmentsEntry, LearnerSummaryEntry} from '../../profile/db/schema';
import {PartnerEntry} from '../../partner/db/schema';
import {ContentAccessEntry, ContentEntry, ContentFeedbackEntry} from '../../content/db/schema';
import {NotificationEntry} from '../../notification/db/schema';

export class InitialMigration extends Migration {

    constructor() {
        super(1, 16);
    }

    apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            console.log('query', query);
            await dbService.execute(query);
        });
    }

    queries(): Array<string> {
        return [
            TelemetryEntry.getCreateEntry(),
            TelemetryProcessedEntry.getCreateEntry(),
            TelemetryTagEntry.getCreateEntry(),
            EventPriorityEntry.getCreateEntry(),
            UserEntry.getCreateEntry(),
            ProfileEntry.getCreateEntry(),
            ImportedMetadataEntry.getCreateEntry(),
            PartnerEntry.getCreateEntry(),
            ContentEntry.getCreateEntry(),
            LearnerAssessmentsEntry.getCreateEntry(),
            LearnerSummaryEntry.getCreateEntry(),
            ContentAccessEntry.getCreateEntry(),
            ContentFeedbackEntry.getCreateEntry(),
            NotificationEntry.getCreateEntry()
        ];
    }


}
