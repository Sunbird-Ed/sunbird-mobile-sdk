import {Request} from './request';
import {Response} from './response';

export interface Connection {

    invoke(request: Request): Promise<Response>;

}