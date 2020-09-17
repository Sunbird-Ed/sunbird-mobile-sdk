import {EventsBusServiceImpl} from './events-bus-service-impl';
import {SdkConfig} from '../../sdk-config';
import { Subject, of, throwError } from 'rxjs';
import { EventsBusEvent, EventNamespace } from '..';
import { RegisterObserverRequest } from '../def/register-observer-request';

interface EventContainer {
    namespace: string;
    event: EventsBusEvent;
}

describe('EventsBusServiceImpl', () => {
    let eventsBusServiceImpl: EventsBusServiceImpl;
    const mockSdkConfig: Partial<SdkConfig> = {
        eventsBusConfig: {
            debugMode: true
        }
    };

    beforeAll(() => {
        eventsBusServiceImpl = new EventsBusServiceImpl(
            mockSdkConfig as SdkConfig
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of eventsBusServiceImpl', () => {
        expect(eventsBusServiceImpl).toBeTruthy();
    });

    it('should invoked emit', () => {
        // arrange
        const data: EventContainer = {
            namespace: 'sample-name-space',
            event: {
                type: 'sample-type',
                payload: {}
            }
        };
        const eventbus = new Subject<EventContainer>();
        eventbus.subscribe({next: jest.fn()});
        // act
        eventsBusServiceImpl.emit(data);
    });

    it('should invoked emit', () => {
        // arrange
        const request: RegisterObserverRequest = {
            namespace: EventNamespace.AUTH,
            observer: {onEvent: jest.fn(() => of())}
        };
        // act
        const data = eventsBusServiceImpl.registerObserver(request);
        expect(data).toBeUndefined();
    });
});
