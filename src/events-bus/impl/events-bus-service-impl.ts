import {EventNamespace, EventsBusEvent, EventsBusService} from '..';
import {Observable, of, Subject, zip} from 'rxjs';
import {EmitRequest} from '../def/emit-request';
import {RegisterObserverRequest} from '../def/register-observer-request';
import {EventObserver} from '../def/event-observer';
import {EventsBusConfig} from '../config/events-bus-config';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {catchError, filter, map, mapTo, take, tap} from 'rxjs/operators';

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
            .pipe(
                tap((eventContainer: EventContainer) => {
                    if (this.eventsBusConfig.debugMode) {
                        console.log('SDK Telemetry Events', eventContainer);
                    }
                }),
                tap(async (eventContainer: EventContainer) => {
                    const delegateHandlers = this.eventDelegates
                        .filter((d) => d.namespace === eventContainer.namespace)
                        .map((d) => d.observer.onEvent(eventContainer.event)
                            .pipe(
                                take(1),
                                catchError((e) => {
                                    console.error('Error: ', e, 'EventObserver: ', d);
                                    return of(undefined);
                                })
                            )
                        );

                    try {
                        await zip(...delegateHandlers).toPromise();
                    } catch (e) {
                        console.error('EVENT_BUS_DELEGATE_ERROR', e);
                    }
                }),
                mapTo(undefined)
            );
    }

    events(eventFilter?: string): Observable<any> {
        return this.eventsBus.asObservable()
            .pipe(
                filter(eventContainer => eventFilter ? eventContainer.namespace === eventFilter : true),
                map((eventContainer) => eventContainer.event)
            );
    }

    emit<T extends EventsBusEvent = any>({namespace, event}: EmitRequest<T>): void {
        this.eventsBus.next({
            namespace,
            event
        });
    }

    registerObserver({namespace, observer}: RegisterObserverRequest) {
        this.eventDelegates.push({namespace, observer});
    }
}
