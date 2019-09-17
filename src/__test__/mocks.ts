import {ApiService} from '../api';
import {mock} from 'ts-mockito';
import {SharedPreferences} from '../util/shared-preferences';
import {EventsBusService} from '../events-bus';

export const MockApiService: ApiService = mock<ApiService>();
export const MockSharedPreferences: SharedPreferences = mock<SharedPreferences>();
export const MockEventsBusService: EventsBusService = mock<EventsBusService>();
