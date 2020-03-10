import {NetworkQueue, NetworkQueueRequest} from '..';
import {SdkServiceOnInitDelegate} from '../../../sdk-service-on-init-delegate';
import {inject, injectable} from 'inversify';
import {BehaviorSubject, concat, defer, Observable} from 'rxjs';
import {InjectionTokens} from '../../../injection-tokens';
import {DbService} from '../../../db';
import PriorityQueue from 'typescript-collections/dist/lib/PriorityQueue';
import {mapTo, tap} from 'rxjs/operators';
import {ApiService, Request as NetworkRequest} from '../..';
import {NetworkQueueEntry} from '..';

@injectable()
export class NetworkQueueImpl implements NetworkQueue, SdkServiceOnInitDelegate {
    private priorityQueue = new PriorityQueue<NetworkQueueRequest>((a, b) => {
        if (a.priority === b.priority) {
            return a.ts - b.ts;
        }

        return a.priority - b.priority;
    });

    private priorityQueue$ = new BehaviorSubject<PriorityQueue<NetworkQueueRequest>>(this.priorityQueue);

    constructor(
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService
    ) {
    }

    onInit(): Observable<undefined> {
        return concat(
            defer(() => this.seed()),
            this.priorityQueue$.pipe(
                tap(this.handleNetworkRequest)
            )
        ).pipe(
            mapTo(undefined)
        );
    }

    private async seed(): Promise<undefined> {
        try {
            const entries = await this.dbService.read({
                table: NetworkQueueEntry.TABLE_NAME,
            }).toPromise();

            entries.map((e) => NetworkQueueEntry.Mapper.entryToNetworkQueueRequest(e)).forEach((e) => {
                this.priorityQueue.enqueue(e);
            });

            this.priorityQueue$.next(this.priorityQueue);
        } catch (e) {
            console.error(e);
        }

        return;
    }

    private async handleNetworkRequest(queue: PriorityQueue<NetworkQueueRequest>) {
        if (queue.isEmpty()) {
            return;
        }

        const request = this.peek()!;

        try {
            await this.apiService.fetch(request.networkRequest).toPromise();
        } catch (e) {
            console.error(e);
        } finally {
            this.dequeue();
            this.priorityQueue$.next(this.priorityQueue);
        }
    }

    dequeue(): NetworkQueueRequest | undefined {
        const networkRequest = this.priorityQueue.dequeue();

        if (!networkRequest) {
            return undefined;
        }

        this.dbService.delete({
            table: NetworkQueueEntry.TABLE_NAME,
            selection: `${NetworkQueueEntry._ID} = ?`,
            selectionArgs: [networkRequest.id + '']
        }).toPromise();

        this.priorityQueue$.next(this.priorityQueue);
        return networkRequest;
    }

    enqueue(request: NetworkQueueRequest): void {
        this.dbService.insert({
            table: NetworkQueueEntry.TABLE_NAME,
            modelJson: NetworkQueueEntry.Mapper.networkQueueRequestToEntry(request)
        }).toPromise();

        this.priorityQueue.enqueue(request);
        this.priorityQueue$.next(this.priorityQueue);
    }

    peek(): NetworkQueueRequest | undefined {
        return this.priorityQueue.peek();
    }
}
