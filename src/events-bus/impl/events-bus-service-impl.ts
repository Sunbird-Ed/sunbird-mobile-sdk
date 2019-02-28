import {EventsBusService} from '../def/events-bus-service';
import {Observable, Subject} from 'rxjs';

export class EventsBusServiceImpl implements EventsBusService {
    private eventsBus = new Subject<any>();

    constructor() {
    }

    events(filter?: string): Observable<any> {
        return this.eventsBus.asObservable();
    }

    emit(event: any): void {

    }
}
