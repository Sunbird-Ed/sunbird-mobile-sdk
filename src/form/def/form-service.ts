import {FormRequest} from './form-request';
import {Observable} from 'rxjs';

export interface FormService {
    getForm(formRequest: FormRequest): Observable<{ [key: string]: any }>;
}
