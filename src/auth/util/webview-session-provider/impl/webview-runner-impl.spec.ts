import {WebviewRunner} from '../def/webview-runner';
import {WebviewRunnerImpl} from './webview-runner-impl';
import {NoInappbrowserSessionAssertionFailError, ParamNotCapturedError} from '../../..';

describe('WebviewRunnerImpl', () => {
    let webviewRunner: WebviewRunner;

    beforeAll(() => {
        webviewRunner = new WebviewRunnerImpl();
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should be able to create an instance', () => {
        expect(webviewRunner).toBeTruthy();
    });

    describe('launchWebview', () => {
        it('should open a cordova InAppBrowser instance', (done) => {
            // arrange
            spyOn(window['cordova']['InAppBrowser'], 'open').and.returnValue(new EventTarget());

            // act
            webviewRunner.launchWebview({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                }
            }).then(() => {
                expect(window['cordova']['InAppBrowser']['open']).toHaveBeenCalledWith(
                    expect.any(String),
                    '_blank',
                    'zoom=no,clearcache=yes,clearsessioncache=yes,cleardata=yes'
                );
                done();
            });
        });

        it('should register an exit eventListener on cordova InAppBrowser instance', (done) => {
            // arrange
            const eventTarget = new EventTarget();
            spyOn(eventTarget, 'addEventListener').and.callThrough();
            spyOn(window['cordova']['InAppBrowser'], 'open').and.returnValue(eventTarget);

            // act
            webviewRunner.launchWebview({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                }
            }).then(() => {
                expect(eventTarget.addEventListener).toHaveBeenCalledWith('exit', expect.any(Function));
                done();
            });
        });

        it('should deregister an exit eventListener when cordova InAppBrowser instance closes', (done) => {
            // arrange
            let exitCallback;
            const eventTarget = new EventTarget();
            spyOn(eventTarget, 'addEventListener').and.callFake((event, cb) => {
                exitCallback = cb;
            });
            spyOn(eventTarget, 'removeEventListener').and.callThrough();
            spyOn(window['cordova']['InAppBrowser'], 'open').and.returnValue(eventTarget);

            // act
            webviewRunner.launchWebview({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                }
            }).then(() => {
                exitCallback();

                expect(webviewRunner['inAppBrowser']).toBeFalsy();
                expect(eventTarget.removeEventListener).toHaveBeenCalledWith('exit', expect.any(Function));
                done();
            });
        });
    });

    describe('closeWebview', () => {
        it('should throw error if invoked before launchWebview()', (done) => {
            // act
            webviewRunner.closeWebview().catch((e) => {
                // assert
                expect(e instanceof NoInappbrowserSessionAssertionFailError);
                done();
            });
        });

        it('should close cordova webview instance if invoked after launchWebview()', (done) => {
            // arrange
            const eventTarget = new EventTarget();
            const close = jest.fn().mockImplementation();
            eventTarget['close'] = close;
            spyOn(window['cordova']['InAppBrowser'], 'open').and.returnValue(eventTarget);

            // act
            webviewRunner.launchWebview({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                }
            }).then(() => {
                webviewRunner.closeWebview().then(() => {
                    // assert
                    expect(eventTarget['close']).toHaveBeenCalled();
                    done();
                });
            });
        });
    });

    describe('any()', () => {
        it('should resolve the first passed promise to resolve', (done) => {
           webviewRunner.any(
               Promise.resolve(1),
               Promise.resolve(2),
               Promise.resolve(3),
               Promise.resolve(4)
           ).then((v) => {
               expect(v).toBe(1);
               done();
           });
        });
    });

    describe('all()', () => {
        it('should resolve when all passed promises resolve', (done) => {
            webviewRunner.all(
                Promise.resolve(1),
                Promise.resolve(2),
                Promise.resolve(3),
                Promise.resolve(4)
            ).then((v) => {
                expect(v).toBe(undefined);
                done();
            });
        });
    });

    describe('launchCustomTab', () => {
        it('should launch customtabs if available', (done) => {
            // arrange
            spyOn(window['customtabs'], 'isAvailable').and.callFake((success, error) => {
                setTimeout(() => {
                    success();
                });
            });

            spyOn(window['customtabs'], 'launch').and.callFake((url, success, error) => {
                setTimeout(() => {
                    success({ 'PARAM': 'VALUE' });
                });
            });

            // act
            webviewRunner.launchCustomTab({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                },
                extraParams: ""
            }).then((v) => {
                expect(window['customtabs']['isAvailable']).toBeCalled();
                expect(window['customtabs']['launch']).toBeCalled();
                done();
            });
        });

        it('should launch customtabs if available and throws error', () => {
            // arrange
            spyOn(window['customtabs'], 'isAvailable').and.callFake((success, error) => {
                setTimeout(() => {
                    success();
                });
            });

            spyOn(window['customtabs'], 'launch').and.callFake((url, success, error) => {
                setTimeout(() => {
                    error({ 'ERROR': 'VALUE' });
                });
            });

            // act
            webviewRunner.launchCustomTab({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                },
                extraParams: ""
            }).then((v) => {
                expect(window['customtabs']['isAvailable']).toBeCalled();
                expect(window['customtabs']['launch']).toBeCalled();
            });
        });

        it('should launch in browser if not available', (done) => {
            // arrange
            spyOn(window['customtabs'], 'isAvailable').and.callFake((success, error) => {
                setTimeout(() => {
                    error();
                });
            });

            spyOn(window['customtabs'], 'launchInBrowser').and.callFake((url, extraParams, success, error) => {
                setTimeout(() => {
                    success({ 'PARAM': 'VALUE' });
                });
            });

            // act
            webviewRunner.launchCustomTab({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                },
                extraParams: ""
            }).then((v) => {
                expect(window['customtabs']['isAvailable']).toBeCalled();
                expect(window['customtabs']['launchInBrowser']).toBeCalled();
                done();
            });
        });

        it('should launch in browser if not available and throw error', () => {
            // arrange
            spyOn(window['customtabs'], 'isAvailable').and.callFake((success, error) => {
                setTimeout(() => {
                    success();
                });
            });

            spyOn(window['customtabs'], 'launchInBrowser').and.callFake((url, extraParams, success, error) => {
                setTimeout(() => {
                    error({ 'ERROR': 'VALUE' });
                });
            });

            // act
            webviewRunner.launchCustomTab({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                },
                extraParams: ""
            }).then((v) => {
                expect(window['customtabs']['isAvailable']).toBeCalled();
                expect(window['customtabs']['launchInBrowser']).toBeCalled();
            });
        });
    });

    describe('capture', () => {
        it('should throw error if invoked before launchWebview()', () => {
            // act
            try {
                webviewRunner.capture({
                    host: 'SOME_HOST',
                    path: 'SOME_PATH',
                    params: [{
                        key: 'PARAM1',
                        resolveTo: 'PARAM1',
                    }]
                });
            } catch (e) {
                expect(e instanceof NoInappbrowserSessionAssertionFailError).toBeTruthy();
            }
        });

        it('should capture params when found', (done) => {
            // arrange
            let loadstartCallback;
            const eventTarget = new EventTarget();
            spyOn(eventTarget, 'addEventListener').and.callFake((event, cb) => {
                loadstartCallback = cb;
            });
            spyOn(eventTarget, 'removeEventListener').and.callThrough();
            spyOn(window['cordova']['InAppBrowser'], 'open').and.returnValue(eventTarget);

            // act
            webviewRunner.launchWebview({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                }
            }).then(() => {
                webviewRunner.capture({
                    host: 'http://some_host',
                    path: '/some_path',
                    params: [{
                        key: 'param1',
                        resolveTo: 'param1',
                    }]
                }).then((v) => {
                    // assert
                    expect(eventTarget.addEventListener).toHaveBeenCalledWith('loadstart', expect.any(Function));
                    expect(eventTarget.removeEventListener).toHaveBeenCalledWith('loadstart', expect.any(Function));
                    done();
                });

                loadstartCallback({ url: 'http://some_host/some_path?param1=TARGET_VALUE&param2=OTHER_VALUE' });
            });
        });
    });

    describe('resolveCaptured', () => {
        it('should throw error when expected param was not captured', (done) => {
            webviewRunner.launchWebview({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                }
            }).then(() => {
                return webviewRunner.resolveCaptured('SOME_PARAM');
            }).catch((e) => {
                expect(e instanceof ParamNotCapturedError).toBeTruthy();
                done();
            });
        });

        it('should resolve with value when expected param was captured', (done) => {
            // arrange
            webviewRunner['captured'] = {'key': 'value'};

            // act
            webviewRunner.resolveCaptured('key').then((v) => {
                // assert
                expect(v).toEqual('value');
                done();
            });
        });
    });

    describe('clearCapture', () => {
        it('should clear all captured values', (done) => {
            // arrange
            webviewRunner['captured'] = {'key': 'value'};

            // act
            webviewRunner.clearCapture().then(() => {
                return webviewRunner.resolveCaptured('key').catch((e) => {
                    expect(e instanceof ParamNotCapturedError).toBeTruthy();
                    done();
                });
            });
        });
    });

    describe('redirectTo', () => {
        it('should throw error if invoked before launchWebview()', (done) => {
            // act
            webviewRunner.redirectTo({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                }
            }).catch((e) => {
                // assert
                expect(e instanceof NoInappbrowserSessionAssertionFailError);
                done();
            });
        });

        it('should redirect cordova webview instance if invoked after launchWebview()', (done) => {
            // arrange
            const eventTarget = new EventTarget();
            const executeScript = jest.fn().mockImplementation();
            eventTarget['executeScript'] = executeScript;
            spyOn(window['cordova']['InAppBrowser'], 'open').and.returnValue(eventTarget);

            // act
            webviewRunner.launchWebview({
                host: 'SAMPLE_HOST',
                path: 'SOME_PATH',
                params: {
                    'PARAM1': 'VALUE1'
                }
            }).then(() => {
                webviewRunner.redirectTo({
                    host: 'http://some_host',
                    path: '/some_path',
                    params: {
                        'param1': 'value1'
                    }
                }).then(() => {
                    // assert
                    expect(executeScript).toHaveBeenCalledWith(expect.objectContaining({
                        code: expect.stringContaining('http://some_host/some_path?param1=value1')
                    }));
                    done();
                });
            });
        });
    });

    describe('success', () => {
        it('should resolve with all captured values', (done) => {
            // arrange
            webviewRunner['captured'] = {'key': 'value'};

            // act
            webviewRunner.success().then((v) => {
                // assert
                expect(v).toEqual(expect.objectContaining({
                    key: 'value'
                }));
                done();
            });
        });
    });

    describe('fail', () => {
        it('should reject with all captured values', (done) => {
            // arrange
            webviewRunner['captured'] = {'key': 'value'};

            // act
            webviewRunner.fail().catch((v) => {
                // assert
                expect(v).toEqual(expect.objectContaining({
                    key: 'value'
                }));
                done();
            });
        });
    });

    describe('getCaptureExtras(0', () => {
        it('should resolve with all captured values', (done) => {
            // arrange
            webviewRunner['extras'] = {'key': 'value'};

            // act
            webviewRunner.getCaptureExtras().then((v) => {
                // assert
                expect(v).toEqual(expect.objectContaining({
                    key: 'value'
                }));
                done();
            });
        });
    });
});
