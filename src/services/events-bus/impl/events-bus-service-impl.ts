import {EventNamespace, EventsBusEvent, EventsBusService} from '..';
import {Observable, Subject} from 'rxjs';
import {EmitRequest} from '../def/emit-request';
import {RegisterObserverRequest} from '../def/register-observer-request';
import {EventObserver} from '../def/event-observer';
import {EventsBusConfig} from '../config/events-bus-config';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {SdkConfig} from '../../../bootstrap/sdk-config';

interface EventContainer {
    namespace: string;
    event: EventsBusEvent;
}

@injectable()
export class EventsBusServiceImpl implements EventsBusService {
    private eventsBus = new Subject<EventContainer>();
    private eventDelegates: { namespace: EventNamespace, observer: EventObserver<EventsBusEvent> }[] = [];
    private eventsBusConfig: EventsBusConfig;

    constructor(@inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig) {
        this.eventsBusConfig = this.sdkConfig.eventsBusConfig;
    }

    onInit(): Observable<undefined> {
        return this.eventsBus
            .do((eventContainer: EventContainer) => {
                if (this.eventsBusConfig.debugMode) {
                    console.log('SDK Telemetry Events', eventContainer);
                }
            })
            .do(async (eventContainer: EventContainer) => {
                const delegateHandlers = this.eventDelegates
                    .filter((d) => d.namespace === eventContainer.namespace)
                    .map((d) => d.observer.onEvent(eventContainer.event)
                        .take(1)
                        .catch((e) => {
                            console.error('Error: ', e, 'EventObserver: ', d);
                            return Observable.of(undefined);
                        })
                    );

                try {
                    await Observable.zip(...delegateHandlers).toPromise();
                } catch (e) {
                    console.error('EVENT_BUS_DELEGATE_ERROR', e);
                }
            })
            .mapTo(undefined);
    }

    events(filter?: string): Observable<any> {
        return this.eventsBus.asObservable()
            .filter((eventContainer) => filter ? eventContainer.namespace === filter : true)
            .map((eventContainer) => eventContainer.event);
    }

    emit({namespace, event}: EmitRequest<EventsBusEvent>): void {
        this.eventsBus.next({
            namespace,
            event
        });
    }

    registerObserver({namespace, observer}: RegisterObserverRequest) {
        this.eventDelegates.push({namespace, observer});
    }
}
