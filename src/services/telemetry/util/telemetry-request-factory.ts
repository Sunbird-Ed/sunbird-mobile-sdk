import {CorrelationData, Environment, PageId, Rollup, TelemetryImpressionRequest, TelemetryInteractRequest} from '../index';

export class TelemetryRequestFactory {
    public static generateBackClickedTelemetry(
        pageId: PageId, env: Environment, isNavBack: boolean, identifier?: string, corRelationList?: CorrelationData[]
    ): TelemetryInteractRequest {
        return {} as any;
    }

    public static generatePageViewTelemetry(
        pageId: PageId, env: Environment, subType?: string
    ): TelemetryImpressionRequest {
        return {} as any;
    }

    public static generateSpineLoadingTelemetry(content: any, isFirstTime: boolean): TelemetryInteractRequest {
        return {} as any;
    }

    public static generateCancelDownloadTelemetry(content: any): TelemetryInteractRequest {
        return {} as any;
    }

    public static generateDownloadAllClickTelemetry(
        pageId: PageId, content: any, downloadingIdentifier: any, childrenCount: number
    ): TelemetryInteractRequest {
        return {} as any;
    }

    public static generatePullToRefreshTelemetry(pageId: PageId, env: Environment): TelemetryInteractRequest {
        return {} as any;
    }

    public static generateReadLessOrReadMore(
        param: any, objRollup: Rollup, corRelationList: CorrelationData[], telemetryObject: any
    ): TelemetryInteractRequest {
        return {} as any;
    }

    public static generateProfilePopulatedTelemetry(
        pageId: PageId, frameworkId: any, mode: any
    ): TelemetryInteractRequest {
        return {} as any;
    }

    public static generateExtraInfoTelemetry(values: { [key: string]: any }, pageId: PageId): TelemetryInteractRequest {
        return {} as any;
    }

    public static generateContentCancelClickedTelemetry(content: any, downloadProgress: string): TelemetryInteractRequest {
        return {} as any;
    }
}
