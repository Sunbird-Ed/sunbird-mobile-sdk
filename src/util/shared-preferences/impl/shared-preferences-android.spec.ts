import {Container} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {SharedPreferences} from '..';
import {SharedPreferencesAndroid} from './shared-preferences-android';

describe('SharedPreferencesAndroid', () => {
    let sharedPreferences: SharedPreferences;
    const container = new Container();

    beforeAll(() => {
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).to(SharedPreferencesAndroid);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('getString()', () => {
        it('should delegate to cordova sharedPreferences', (done) => {
            spyOn(window['plugins'].SharedPreferences, 'getInstance').and.returnValue({
                getString: (a, b, c, d) => {
                    setTimeout(() => {
                        c('SOME_VALUE');
                    }, 0);
                }
            });

            sharedPreferences = container.get(InjectionTokens.SHARED_PREFERENCES);

            sharedPreferences.getString('SOME_KEY').subscribe((v) => {
                expect(v).toBe('SOME_VALUE');
                done();
            });
        });

        it('should delegate to cordova sharedPreferences', (done) => {
            spyOn(window['plugins'].SharedPreferences, 'getInstance').and.returnValue({
                getString: (a, b, c, d) => {
                    setTimeout(() => {
                        d('SOME_ERROR');
                    }, 0);
                }
            });

            sharedPreferences = container.get(InjectionTokens.SHARED_PREFERENCES);

            sharedPreferences.getString('SOME_KEY').subscribe(null, (e) => {
                expect(e).toBe('SOME_ERROR');
                done();
            });
        });
    });

    describe('putString()', () => {
        it('should delegate to cordova sharedPreferences', (done) => {
            spyOn(window['plugins'].SharedPreferences, 'getInstance').and.returnValue({
                putString: (a, b, c, d) => {
                    setTimeout(() => {
                        c();
                    }, 0);
                }
            });

            sharedPreferences = container.get(InjectionTokens.SHARED_PREFERENCES);

            sharedPreferences.putString('SOME_KEY', 'SOME_VALUE').subscribe((v) => {
                done();
            });
        });

        it('should delegate to cordova sharedPreferences', (done) => {
            spyOn(window['plugins'].SharedPreferences, 'getInstance').and.returnValue({
                putString: (a, b, c, d) => {
                    setTimeout(() => {
                        d('SOME_ERROR');
                    }, 0);
                }
            });

            sharedPreferences = container.get(InjectionTokens.SHARED_PREFERENCES);

            sharedPreferences.putString('SOME_KEY', 'SOME_VALUE').subscribe(null, (e) => {
                expect(e).toBe('SOME_ERROR');
                done();
            });
        });
    });

    describe('getBoolean()', () => {
        it('should delegate to cordova sharedPreferences', (done) => {
            spyOn(window['plugins'].SharedPreferences, 'getInstance').and.returnValue({
                getBoolean: (a, b, c, d) => {
                    setTimeout(() => {
                        c(true);
                    }, 0);
                }
            });

            sharedPreferences = container.get(InjectionTokens.SHARED_PREFERENCES);

            sharedPreferences.getBoolean('SOME_KEY').subscribe((v) => {
                expect(v).toBe(true);
                done();
            });
        });

        it('should delegate to cordova sharedPreferences', (done) => {
            spyOn(window['plugins'].SharedPreferences, 'getInstance').and.returnValue({
                getBoolean: (a, b, c, d) => {
                    setTimeout(() => {
                        d('SOME_ERROR');
                    }, 0);
                }
            });

            sharedPreferences = container.get(InjectionTokens.SHARED_PREFERENCES);

            sharedPreferences.getBoolean('SOME_KEY').subscribe(null, (e) => {
                expect(e).toBe('SOME_ERROR');
                done();
            });
        });
    });

    describe('putBoolean()', () => {
        it('should delegate to cordova sharedPreferences', (done) => {
            spyOn(window['plugins'].SharedPreferences, 'getInstance').and.returnValue({
                putBoolean: (a, b, c, d) => {
                    setTimeout(() => {
                        c(true);
                    }, 0);
                }
            });

            sharedPreferences = container.get(InjectionTokens.SHARED_PREFERENCES);

            sharedPreferences.putBoolean('SOME_KEY', true).subscribe((v) => {
                done();
            });
        });

        it('should delegate to cordova sharedPreferences', (done) => {
            spyOn(window['plugins'].SharedPreferences, 'getInstance').and.returnValue({
                putBoolean: (a, b, c, d) => {
                    setTimeout(() => {
                        d('SOME_ERROR');
                    }, 0);
                }
            });

            sharedPreferences = container.get(InjectionTokens.SHARED_PREFERENCES);

            sharedPreferences.putBoolean('SOME_KEY', true).subscribe(null, (e) => {
                expect(e).toBe('SOME_ERROR');
                done();
            });
        });
    });
});
