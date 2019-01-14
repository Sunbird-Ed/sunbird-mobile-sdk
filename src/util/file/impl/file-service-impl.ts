import { FileService } from './../def/file-service';
import {Observable} from 'rxjs';

declare var file: {
    // TODO
    // read: () => void;
};

export class FileServiceImpl implements FileService {

    read(path: string): Observable<any> {
        // TODO
        const observable = new Observable;
        return observable;

    }

}
