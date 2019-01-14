import {Observable} from 'rxjs';

export interface FileService {

    read(path: string): Observable<any>;

}
