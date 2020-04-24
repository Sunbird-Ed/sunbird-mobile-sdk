import {DbService, Migration} from '..';
import {NetworkQueueEntry} from '../../api/network-queue/db/schema';
import {map} from 'rxjs/operators';
import {TelemetryProcessedEntry} from '../../telemetry/db/schema';
import {HttpRequestType, HttpSerializer, Request} from '../../api';
import {NetworkQueue, NetworkQueueRequest} from '../../api/network-queue';
import {TelemetrySyncHandler} from '../../telemetry/handler/telemetry-sync-handler';
import {TelemetryConfig} from '../../telemetry/config/telemetry-config';

export class NetworkQueueMigration extends Migration {

  constructor(private telemetryConfig: TelemetryConfig,
              private networkQueue: NetworkQueue) {
    super(14, 27);
  }

  public async apply(dbService: DbService) {
    await Promise.all(this.queries().map((query) => dbService.execute(query).toPromise()));
    await dbService.read({
      table: TelemetryProcessedEntry.TABLE_NAME,
      selection: '',
      selectionArgs: []
    }).pipe(
      map((rows: TelemetryProcessedEntry.SchemaMap[]) => {
        rows.forEach(async (processedEventsBatchEntry: TelemetryProcessedEntry.SchemaMap) => {
          if (processedEventsBatchEntry) {
            const messageId = processedEventsBatchEntry[TelemetryProcessedEntry.COLUMN_NAME_MSG_ID];
            const data = processedEventsBatchEntry[TelemetryProcessedEntry.COLUMN_NAME_DATA];
            const eventsCount = processedEventsBatchEntry[TelemetryProcessedEntry.COLUMN_NAME_NUMBER_OF_EVENTS];
            await this.networkQueue.enqueue(this.getNetworkQueueRequest(data, messageId, eventsCount), false).toPromise();
            console.log('Executing', 'Delete');
            await dbService.execute(
              `DELETE FROM ${TelemetryProcessedEntry.TABLE_NAME} WHERE ${TelemetryProcessedEntry.COLUMN_NAME_MSG_ID}='${messageId}'`)
              .toPromise();
          }
        });
      })
    ).toPromise();
    return undefined;
  }

  queries(): Array<string> {
    return [
      NetworkQueueEntry.getCreateEntry()
    ];
  }

  private getNetworkQueueRequest(processedEvents, messageId, eventsCount): NetworkQueueRequest {
    const gzippedCharData = processedEvents.split('').map((c) => {
      return c.charCodeAt(0);
    });
    const body = new Uint8Array(gzippedCharData);
    const apiRequest: Request = new Request.Builder()
      .withSerializer(HttpSerializer.RAW)
      .withHost(this.telemetryConfig.host!)
      .withType(HttpRequestType.POST)
      .withPath(this.telemetryConfig.apiPath + TelemetrySyncHandler.TELEMETRY_ENDPOINT)
      .withHeaders({
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      })
      .withBody(body)
      .withApiToken(true)
      .build();
    const networkQueueRequest: NetworkQueueRequest = {
      msgId: messageId!,
      data: processedEvents,
      networkRequest: apiRequest,
      priority: 1,
      itemCount: eventsCount,
      config: JSON.stringify({shouldPublishResult: false}),
      ts: Date.now()
    };
    return networkQueueRequest;
  }
}
