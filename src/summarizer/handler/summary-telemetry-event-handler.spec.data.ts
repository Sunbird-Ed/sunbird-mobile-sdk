import { ProducerData, SunbirdTelemetry, TelemetryObject } from '../../telemetry';
import Telemetry = SunbirdTelemetry.Telemetry;

const data = new ProducerData();
data.id = 'staging.diksha.app';
data.pid = 'contentplayer';
data.ver = '2.4.local.0-debug';
const setData = new TelemetryObject('836e43c400f286df82f489e7ea90fe26be64fdc6', 'course', '');
setData.rollup = {
    l1: ''
};

export const telemetry: Telemetry = {
    ver: '3.0',
    eid: 'START',
    ets: 1572861279365,
    actor: {
        type: 'User',
        id: '85f16f8b-fc5b-4834-993b-4e88b224ccfa'
    },
    context: {
        channel: '505c7c48ac6dc1edc9b08f21db5a571d',
        pdata: data,
        env: 'app',
        sid: '13e01d78-dd28-46f8-b08c-c52d0f5c7557',
        did: '836e43c400f286df82f489e7ea90fe26be64fdc6',
        cdata: [{id: 'id', type: 'AttemptId'}],
        rollup: {
            l1: ''
        },
    },
    object: setData,
    edata: {
        errtype: 'Error',
        stacktrace: 'Error: Uncaught(inpromise): Invalidaction\natresolvePromise(http: //localhost/polyfills.js:' +
            '3193: 31)\nathttp: //localhost/polyfills.js: 3103: 17\natr(http: //localhost/vendor.js:' +
            '154070: 549596)\natZoneDelegate.push../node_modules/zone.j',
        'pageid': 'library',
    },
    mid: '449d1d2-58ff-4251-8fe8-09afcc2a8100',
    tags: ['']
};
