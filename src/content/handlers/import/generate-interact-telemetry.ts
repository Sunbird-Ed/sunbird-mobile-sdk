import {InteractType, TelemetryInteractRequest, TelemetryService} from '../../../telemetry';
import {ImportContentContext} from '../..';
import {Response} from '../../../api';
import {ContentUtil} from '../../util/content-util';
import { map } from 'rxjs/operators';

export class GenerateInteractTelemetry {

    constructor(private telemetryService: TelemetryService) {
    }

    execute(importContext: ImportContentContext, subType): Promise<Response> {
        const identifier =  importContext.items && importContext.items!.length ?
            importContext.items[0]['identifier'] : '';
        const telemetryInteractRequest = new TelemetryInteractRequest();
        telemetryInteractRequest.type = InteractType.OTHER;
        telemetryInteractRequest.subType = subType;
        telemetryInteractRequest.pageId = 'ImportContent';
        telemetryInteractRequest.id = 'ImportContent';
        telemetryInteractRequest.env = 'sdk';
        telemetryInteractRequest.objId =  identifier ? identifier : importContext.identifier,
        telemetryInteractRequest.objType = importContext.items && importContext.items.length ?
            ContentUtil.readPrimaryCategoryServer(importContext.items[0]) : '';
        telemetryInteractRequest.objVer = importContext.items && importContext.items.length ?
            ContentUtil.readPkgVersion(importContext.items[0]) + '' : '';
        telemetryInteractRequest.correlationData = importContext.correlationData;

        const response: Response = new Response();
        response.body = importContext;
        return this.telemetryService.interact(telemetryInteractRequest).pipe(
            map(() => {
                return response;
            })
        ).toPromise();
    }

}
