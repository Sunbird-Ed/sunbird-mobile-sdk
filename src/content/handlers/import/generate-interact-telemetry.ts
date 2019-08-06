import {InteractType, TelemetryInteractRequest, TelemetryService} from '../../../telemetry';
import {ImportContentContext} from '../..';
import {Response} from '../../../api';

export class GenerateInteractTelemetry {

    constructor(private telemetryService: TelemetryService) {
    }

    execute(importContext: ImportContentContext, subType): Promise<Response> {
        const telemetryInteractRequest = new TelemetryInteractRequest();
        telemetryInteractRequest.type = InteractType.OTHER;
        telemetryInteractRequest.subType = subType;
        telemetryInteractRequest.pageId = 'ImportContent';
        telemetryInteractRequest.id = 'ImportContent';
        telemetryInteractRequest.env = 'sdk';
        telemetryInteractRequest.objType = 'Content';
        telemetryInteractRequest.correlationData = importContext.correlationData;

        const response: Response = new Response();
        response.body = importContext;
        return this.telemetryService.interact(telemetryInteractRequest).map(() => {
            return response;
        }).toPromise();
    }

}
