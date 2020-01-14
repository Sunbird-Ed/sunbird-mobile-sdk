import { OpenRapConfigurable } from '../../open-rap-configurable';
export interface ContentServiceConfig extends OpenRapConfigurable {
    apiPath: string;
    searchApiPath: string;
    contentHeirarchyAPIPath: string;
}
