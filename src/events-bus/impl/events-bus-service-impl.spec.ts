import {EventsBusServiceImpl} from './events-bus-service-impl';
import {SdkConfig} from '../../sdk-config';
import {EventNamespace} from '..';
import {ContentEvent, ContentEventType} from '../../content';
import {take} from 'rxjs/operators';
import {EventObserver} from '../def/event-observer';
import {Observable, of} from 'rxjs';

describe('EventsBusServiceImpl', () => {
    let eventsBusService: EventsBusServiceImpl;
    const mockSdkConfig: Partial<SdkConfig> = {
        eventsBusConfig: {
            debugMode: true
        }
    };

    beforeAll(() => {
        eventsBusService = new EventsBusServiceImpl(
            mockSdkConfig as SdkConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of eventsBusServiceImpl', () => {
        expect(eventsBusService).toBeTruthy();
    });

    describe('onInit()', () => {
        it('should log events if debug mode is enabled', (done) => {
            // arrange
            spyOn(console, 'log');

            eventsBusService.onInit().pipe(
                take(1)
            ).subscribe(() => {
                expect(console.log).toHaveBeenCalledWith('SDK Telemetry Events', {
                    namespace: EventNamespace.CONTENT,
                    event: {
                        type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                        payload: {}
                    }
                });
                done();
            });

            // act
            eventsBusService.emit<ContentEvent>({
                namespace: EventNamespace.CONTENT,
                event: {
                    type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                    payload: {}
                }
            });
        });

        it('should not log events if debug mode is enabled', (done) => {
            // arrange
            eventsBusService = new EventsBusServiceImpl({
                eventsBusConfig: {
                    debugMode: false
                }
            } as Partial<SdkConfig> as SdkConfig);

            spyOn(console, 'log');

            eventsBusService.onInit().pipe(
                take(1)
            ).subscribe(() => {
                expect(console.log).not.toHaveBeenCalledWith('SDK Telemetry Events', {
                    namespace: EventNamespace.CONTENT,
                    event: {
                        type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                        payload: {}
                    }
                });
                done();
            });

            // act
            eventsBusService.emit<ContentEvent>({
                namespace: EventNamespace.CONTENT,
                event: {
                    type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                    payload: {}
                }
            });
        });

        it('should emit events to any registered observers', (done) => {
            // arrange
            spyOn(console, 'log');

            eventsBusService.onInit().pipe(
                take(1)
            ).subscribe();

            eventsBusService.registerObserver({
                namespace: EventNamespace.CONTENT,
                observer: new class implements EventObserver<any> {
                    onEvent(event: any): Observable<undefined> {
                        // assert
                        expect(event).toEqual({
                            type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                            payload: {}
                        });
                        done();
                        return of(undefined);
                    }
                }
            });

            // act
            eventsBusService.emit<ContentEvent>({
                namespace: EventNamespace.CONTENT,
                event: {
                    type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                    payload: {}
                }
            });
        });
    });

    describe('emit()', () => {
        it('should be able to emit/observe an event with appropriate namespace', (done) => {
            // arrange
            eventsBusService.events(EventNamespace.CONTENT).pipe(
                take(1)
            ).subscribe((e) => {
                // assert
                expect(e).toEqual({
                    type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                    payload: {}
                });
                done();
            });

            // act
            eventsBusService.emit<ContentEvent>({
                namespace: EventNamespace.CONTENT,
                event: {
                    type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                    payload: {}
                }
            });
        });

        it('should be able to observe all events without a namespace', (done) => {
            // arrange
            eventsBusService.events().pipe(
                take(1)
            ).subscribe((e) => {
                // assert
                expect(e).toEqual({
                    type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                    payload: {}
                });
                done();
            });

            // act
            eventsBusService.emit<ContentEvent>({
                namespace: EventNamespace.CONTENT,
                event: {
                    type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                    payload: {}
                }
            });
        });
    });
});
