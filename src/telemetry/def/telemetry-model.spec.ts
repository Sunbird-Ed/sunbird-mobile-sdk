import {Actor, AuditState, SunbirdTelemetry} from './telemetry-model';
import End = SunbirdTelemetry.End;
import Start = SunbirdTelemetry.Start;
import Interact = SunbirdTelemetry.Interact;
import Impression = SunbirdTelemetry.Impression;
import Log = SunbirdTelemetry.Log;
import Error = SunbirdTelemetry.Error;
import Interrupt = SunbirdTelemetry.Interrupt;
import Share = SunbirdTelemetry.Share;
import Feedback = SunbirdTelemetry.Feedback;
import Audit = SunbirdTelemetry.Audit;

describe('Telemetry models', () => {
    describe('End', () => {
        it('should be able to create an End Telemetry instance without optional args', () => {
            expect(new End(
                '',
                '',
                0,
                '',
                undefined,
                'SOME_ENV'
            )).toBeTruthy();
        });
    });

    describe('Start', () => {
        it('should be able to create a START Telemetry instance without optional args', () => {
            expect(new Start(
                '',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                'SOME_ENV',
                undefined,
                undefined,
                undefined,
                undefined
            )).toBeTruthy();

            expect(new Start(
                'SOME_TYPE',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                'SOME_ENV',
                undefined,
                undefined,
                undefined,
                undefined
            )).toBeTruthy();

            expect(new Start(
                'SOME_TYPE',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                'SOME_ENV',
                undefined,
                undefined,
                undefined,
                {l1: 'l1'}
            )).toBeTruthy();
        });
    });

    describe('Interact', () => {
        it('should be able to create an Interact Telemetry instance without optional args', () => {
            expect(new Interact(
                '',
                '',
                undefined,
                undefined,
                undefined,
                undefined,
                ''
            )).toBeTruthy();

            expect(new Interact(
                '',
                '',
                undefined,
                undefined,
                undefined,
                {'key': 'value'},
                '',
                undefined,
                undefined,
                undefined,
                {l1: 'l1'}
            )).toBeTruthy();
        });
    });

    describe('Impression', () => {
        it('should be able to create an Impression Telemetry instance without optional args', () => {
            expect(new Impression(
                undefined,
                undefined,
                undefined,
                undefined,
                ''
            )).toBeTruthy();

            expect(new Impression(
                undefined,
                'subType',
                undefined,
                undefined,
                '',
                undefined,
                undefined,
                undefined,
                {l1: 'l1'}
            )).toBeTruthy();
        });
    });

    describe('Log', () => {
        it('should be able to create an Log Telemetry instance without optional args', () => {
            expect(new Log(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                '',
                ''
            )).toBeTruthy();
        });
    });

    describe('Error', () => {
        it('should be able to create an Error Telemetry instance without optional args', () => {
            expect(new Error(
                undefined,
                undefined,
                undefined,
                undefined,
            )).toBeTruthy();
        });
    });

    describe('Interrupt', () => {
        it('should be able to create an Interrupt Telemetry instance without optional args', () => {
            expect(new Interrupt(
                '',
                undefined,
            )).toBeTruthy();
        });
    });

    describe('Share', () => {
        it('should be able to create an Share Telemetry instance without optional args', () => {
            expect(new Share(
                undefined,
                undefined,
                undefined,
            )).toBeTruthy();
        });
    });

    describe('Feedback', () => {
        it('should be able to create an Feedback Telemetry instance without optional args', () => {
            expect(new Feedback(
                undefined,
                undefined,
                '',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            )).toBeTruthy();
        });
    });

    describe('Audit', () => {
        it('should be able to create an Audit Telemetry instance without optional args', () => {
            expect(new Audit(
                '',
                new Actor(),
                AuditState.AUDIT_CREATED,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            )).toBeTruthy();

            expect(new Audit(
                '',
                new Actor(),
                AuditState.AUDIT_CREATED,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                {l1: 'l1'}
            )).toBeTruthy();
        });
    });
});
