import {InteractType, TelemetryInteractRequest, TelemetryService} from '../../../telemetry';
import {ImportContentContext} from '../../index';
import {Response} from '../../../../native/http';

export class GenerateInteractTelemetry {

    constructor(private telemetryService: TelemetryService) {
    }

    execute(importContext: ImportContentContext, subType): Promise<Response> {
        const response: Response = new Response();
        const telemetryInteractRequest = new TelemetryInteractRequest();
        telemetryInteractRequest.type = InteractType.OTHER;
        telemetryInteractRequest.subType = subType;
        telemetryInteractRequest.pageId = 'ImportContent';
        telemetryInteractRequest.id = 'ImportContent';
        telemetryInteractRequest.env = 'sdk';
        telemetryInteractRequest.objType = 'Content';
        telemetryInteractRequest.correlationData = importContext.correlationData;
        response.body = importContext;
        return this.telemetryService.interact(telemetryInteractRequest).map(() => {
            return response;
        }).toPromise();
    }

}
