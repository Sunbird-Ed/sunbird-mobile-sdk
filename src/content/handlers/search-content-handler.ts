import {
  ContentData,
  ContentImport,
  ContentSearchCriteria,
  ContentSearchFilter,
  ContentSearchResult,
  ContentServiceConfig,
  ContentSortCriteria,
  FilterValue,
  MimeType,
  SearchResponse,
  SearchType,
  SortOrder
} from '..';
import {AppConfig} from '../../api/config/app-config';
import {SearchFilter, SearchRequest} from '../def/search-request';
import {InteractType, TelemetryInteractRequest, TelemetryService} from '../../telemetry';
import {NumberUtil} from '../../util/number-util';

export class SearchContentHandler {

  constructor(private appConfig: AppConfig,
              private contentServiceConfig: ContentServiceConfig,
              private telemetryService: TelemetryService) {
  }

  getSearchCriteria(requestMap: { [key: string]: any }): ContentSearchCriteria {
    const request: { [key: string]: any } = requestMap['request'];
    const query = request['query'];
    const exists = request['exists'];
    const limit = request['limit'];
    const offset = request['offset'];
    let mode;
    if (request.hasOwnProperty('mode') && request['mode'] === 'soft') {
      mode = 'soft';
    }
    const sortCriteria: ContentSortCriteria[] = [];
    if (request.hasOwnProperty('sort_by')) {
      const sortBy = request['sort_by'];
      Object.keys(sortBy).forEach((key) => {

        const criteria: ContentSortCriteria = {
          sortAttribute: key,
          sortOrder: this.getSortOrder(String(sortBy[key]))
        };
        sortCriteria.push(criteria);
      });
    }

    const contentSearchCriteria: ContentSearchCriteria = {
      ...((query ? {query: query} : {})),
      ...((exists ? {exists: exists} : {})),
      mode: mode,
      sortCriteria: sortCriteria,
      searchType: this.getSearchType(String(request['searchType'])),
      offset: offset ? offset : 0,
      limit: limit ? limit : 100
    };

    let contentTypes;
    let primaryCategories;
    let impliedFilter;
    if (request.hasOwnProperty('filters')) {
      const filterMap: SearchFilter = request['filters'] as SearchFilter;
      if (filterMap.contentType) {
        contentTypes = filterMap.contentType;
      }
      if (filterMap.primaryCategory) {
        primaryCategories = filterMap.primaryCategory;
      }
      impliedFilter = this.mapFilterValues(filterMap, contentSearchCriteria);
      contentSearchCriteria.impliedFilters = impliedFilter;
      contentSearchCriteria.contentTypes = contentTypes;
      contentSearchCriteria.primaryCategories = primaryCategories;
    }
    let facets: string[];
    if (request.hasOwnProperty('facets')) {
      facets = request['facets'];
      contentSearchCriteria.facets = facets;
    }

    return contentSearchCriteria;
  }

  getSearchContentRequest(criteria: ContentSearchCriteria): SearchRequest {
    return {
      query: criteria.query,
      offset: criteria.offset,
      limit: criteria.limit,
      mode: criteria.mode,
      exists: (criteria.exists && criteria.exists.length > 0) ? criteria.exists : [],
      facets: (criteria.facets && criteria.facets.length > 0) ? criteria.facets : [],
      sort_by: this.getSortByRequest(criteria.sortCriteria!),
      filters: this.getSearchFilter(criteria),
      fields: criteria.fields
    };
  }

  private getSearchFilter(criteria: ContentSearchCriteria): SearchFilter {
    if (criteria.searchType!.valueOf() === SearchType.SEARCH.valueOf()) {
      return this.getSearchRequest(criteria);
    } else if (criteria.searchType!.valueOf() === SearchType.FILTER.valueOf()) {
      return this.getFilterRequest(criteria);
    }
    return {};
  }

  private getFilterRequest(criteria: ContentSearchCriteria): SearchFilter {
    let searchFilter: SearchFilter = {};
    this.addFiltersToRequest(searchFilter, criteria.facetFilters!);
    this.addFiltersToRequest(searchFilter, criteria.impliedFilters!);

    if (criteria.impliedFiltersMap && criteria.impliedFiltersMap.length > 0) {
      criteria.impliedFiltersMap.forEach(filterMap => {
        searchFilter = {
          ...searchFilter,
          ...filterMap
        };
      });
    }
    return searchFilter;
  }

  private addFiltersToRequest(searchFilter: SearchFilter, filter: ContentSearchFilter[]) {
    if (filter && filter.length) {
      filter.forEach(facetFilter => {
        const filterValueList: string[] = [];
        facetFilter.values.forEach(value => {
          if (value.apply) {
            filterValueList.push(value.name);
          }
        });

        if (filterValueList.length) {
          let key = facetFilter.name;
          switch (facetFilter.name) {
            case 'board':
              key = 'se_boards';
              break;
            case 'medium':
              key = 'se_mediums';
              break;
            case 'gradeLevel':
            case 'grade':
              key = 'se_gradeLevels';
              break;
          }
          searchFilter[key] = filterValueList;
        }
      });
    }
  }

  private getSearchRequest(criteria: ContentSearchCriteria): SearchFilter {
    const filter =  {
      audience: (criteria.audience && criteria.audience.length > 0) ? criteria.audience : [],
      status: criteria.contentStatusArray,
      objectType: ['Content', 'QuestionSet'],
      contentType: (criteria.contentTypes && criteria.contentTypes.length > 0) ? criteria.contentTypes : [],
      primaryCategory: (criteria.primaryCategories && criteria.primaryCategories.length > 0) ? criteria.primaryCategories : [],
      ...((criteria.keywords && criteria.keywords.length) ? {keywords: criteria.keywords} : {}),
      ...((criteria.dialCodes && criteria.dialCodes.length) ? {dialcodes: criteria.dialCodes} : {}),
      ...((criteria.createdBy && criteria.createdBy.length) ? {createdBy: criteria.createdBy} : {}),
      ...((criteria.grade && criteria.grade.length) ? {se_gradeLevels: criteria.grade} : {}),
      se_mediums: (criteria.medium && criteria.medium.length > 0) ? criteria.medium : [],
      se_boards: (criteria.board && criteria.board.length > 0) ? criteria.board : [],
      language: (criteria.language && criteria.language.length > 0) ? criteria.language : [],
      topic: (criteria.topic && criteria.topic.length > 0) ? criteria.topic : [],
      purpose: (criteria.purpose && criteria.purpose.length > 0) ? criteria.purpose : [],
      channel: (criteria.channel && criteria.channel.length > 0) ? criteria.channel : [],
      mimeType: (criteria.mimeType && criteria.mimeType.length > 0) ? criteria.mimeType : [],
      subject: (criteria.subject && criteria.subject.length > 0) ? criteria.subject : []
    };

    if (criteria.impliedFiltersMap) {
      criteria.impliedFiltersMap.forEach(impliedFilter => {
        Object.keys(impliedFilter).forEach(key => {
          filter[key] = impliedFilter[key];
        });
      });
    }
    if (criteria.impliedFilters) {
      criteria.impliedFilters.forEach(impliedFilter => {
        Object.keys(impliedFilter).forEach(key => {
          const values = impliedFilter['values'];
          const name = impliedFilter['name'];
          const filterValues = this.getImpliedFilterValues(values);
          if (!filter[name]) {
            filter[name] = [];
          }
          if (filter[name]) {
            const mergedValues = filter[name].concat(filterValues);
            if (mergedValues) {
              filter[name] = mergedValues.filter((val, i) => mergedValues.indexOf(val) === i);
            }
          }
        });
      });
    }
    return filter;
  }

  private getImpliedFilterValues(values: FilterValue[]): string[] {
    const filterValues: string[] = [];
    if (!values) {
      return [];
    }
    values.forEach((item) => {
      if (item.apply) {
        filterValues.push(item.name);
      }
    });
    return filterValues;
  }

  getSortByRequest(sortCriteria?: ContentSortCriteria[]): { [key: string]: SortOrder } {
    if (!sortCriteria) {
      return {};
    }

    return sortCriteria.reduce((acc, criteria) => {
      acc[criteria.sortAttribute] = criteria.sortOrder;
      return acc;
    }, {});
  }

  createFilterCriteria(previouscriteria: ContentSearchCriteria, facets: ContentSearchFilter[],
                       appliedFilterMap: SearchFilter): ContentSearchCriteria {
    const facetFilters: ContentSearchFilter[] = [];
    const contentSearchCriteria: ContentSearchCriteria = {
      query: previouscriteria.query,
      limit: previouscriteria.limit,
      offset: previouscriteria.offset,
      facets: previouscriteria.facets,
      contentTypes: previouscriteria.contentTypes,
      primaryCategories: previouscriteria.primaryCategories,
      sortCriteria: previouscriteria.sortCriteria && previouscriteria.sortCriteria.length
        ? previouscriteria.sortCriteria : [],
      mode: previouscriteria.mode === 'soft' ? 'soft' : 'hard',
    };

    if (!facets) {
      return contentSearchCriteria;
    }

    facets.forEach((facet) => {
      const appliedFilter: string[] = appliedFilterMap ? appliedFilterMap[facet.name] : [];
      const facetValues: FilterValue[] = facet.values;
      const values = this.getSortedFilterValuesWithAppliedFilters(facetValues, appliedFilter);
      if (facet.name) {
        const filter: ContentSearchFilter = {
          name: facet.name,
          values: values
        };

        facetFilters.push(filter);
      }
      delete appliedFilterMap[facet.name];
    });
    contentSearchCriteria.facetFilters = facetFilters;
    contentSearchCriteria.impliedFilters = this.mapFilterValues(appliedFilterMap, contentSearchCriteria);
    return contentSearchCriteria;
  }

  addFilterValue(facets: ContentSearchFilter[], filters) {
    if (facets && facets.length > 0) {
      facets.forEach(facet => {
        const facetName: string = facet.name;
        const values: FilterValue[] = facet.values;
        const appliedFilter: string[] = filters[facetName];
      });
    }
  }

  getFilterValuesWithAppliedFilter(facetValues: FilterValue[], appliedFilter: any): FilterValue[] {
    facetValues.forEach(facetValue => {
      let isApplied = false;
      if (appliedFilter && appliedFilter.indexOf(name) > -1) {
        isApplied = true;
      }
      facetValue.apply = isApplied;
    });
    return facetValues;
  }

  mapSearchResponse(previousContentCriteria: ContentSearchCriteria, searchResponse: SearchResponse,
      searchRequest: SearchRequest): ContentSearchResult {
      const contenDataList = (searchResponse.result.content || [] ).concat((searchResponse.result.QuestionSet || [] ));
      const constentSearchResult: ContentSearchResult = {
      id: searchResponse.id,
      responseMessageId: searchResponse.params.resmsgid,
      filterCriteria: this.createFilterCriteria(previousContentCriteria, searchResponse.result.facets, searchRequest.filters),
      request: searchRequest,
      contentDataList: contenDataList,
      count: searchResponse.result.count,
      collectionDataList: searchResponse.result.collections ? searchResponse.result.collections : []
    };
    return constentSearchResult;
  }

  public getContentSearchFilter(contentIds: string[], status: string[], fields: (keyof ContentData)[] = []): SearchRequest {
    return {
      filters: {
        identifier: contentIds.filter((v, i) => contentIds.indexOf(v) === i),
        status: status,
        objectType: ['Content']
      },
      fields: [
        ...fields,
        'downloadUrl', 'variants', 'mimeType', 'contentType', 'primaryCategory', 'pkgVersion'
      ]
    };
  }

  public async getDownloadUrl(contentData: ContentData, contentImport?: ContentImport): Promise<string> {
    let downloadUrl;
    let varientType;
    let variants;

    try{
      variants = (contentData.variants && typeof contentData.variants==='string') ? JSON.parse(contentData.variants) : contentData.variants;
    } catch{
      variants = contentData.variants;
    }

    if (contentData.mimeType === MimeType.COLLECTION.valueOf()) {
      if (variants && variants['online']) {
        varientType = 'online';
      } else if (variants && variants['spine']) {
        varientType = 'spine';
      }
    } else if(contentData.mimeType === MimeType.QUESTION_SET){
      if (variants && variants['full']) {
        varientType = 'full';
      } else if(variants && variants['online']){
        varientType = 'online';
      }
    }

    if (variants && varientType && variants[varientType]) {
      const spineData = variants[varientType];
      downloadUrl = spineData && spineData['ecarUrl'];
      await this.buildContentLoadingEvent(varientType, contentImport!,
        contentData.primaryCategory || contentData.contentType, contentData.pkgVersion);
    }

    if (!downloadUrl) {
      downloadUrl = contentData.downloadUrl!.trim();
      await this.buildContentLoadingEvent('full', contentImport!,
        contentData.primaryCategory || contentData.contentType, contentData.pkgVersion);
    }
    return downloadUrl;
  }

  buildContentLoadingEvent(subtype: string, contentImport: ContentImport, contentType: string, contentVersion: string): Promise<boolean> {
    const telemetryInteractRequest = new TelemetryInteractRequest();
    telemetryInteractRequest.type = InteractType.OTHER;
    telemetryInteractRequest.subType = subtype;
    telemetryInteractRequest.pageId = 'ImportContent';
    telemetryInteractRequest.id = 'ImportContent';
    telemetryInteractRequest.objId = contentImport.contentId;
    telemetryInteractRequest.objType = contentType;
    telemetryInteractRequest.objVer = contentVersion;
    telemetryInteractRequest.rollup = contentImport.rollUp;
    telemetryInteractRequest.correlationData = contentImport.correlationData;
    return this.telemetryService.interact(telemetryInteractRequest).toPromise();
  }

  private getSortOrder(order): SortOrder {
    let sortOrder: SortOrder;
    if (order === 'asc') {
      sortOrder = SortOrder.ASC;
    } else if (order === 'desc') {
      sortOrder = SortOrder.DESC;
    } else {
      sortOrder = SortOrder.DESC;
    }
    return sortOrder;
  }

  private getSearchType(type): SearchType {
    let searchType: SearchType;
    if (type === 'search') {
      searchType = SearchType.SEARCH;
    } else if (type === 'filter') {
      searchType = SearchType.FILTER;
    } else {
      searchType = SearchType.SEARCH;
    }
    return searchType;
  }

  private getSortedFilterValuesWithAppliedFilters(facetValues: FilterValue[], appliedFilters: string[]): FilterValue[] {
    facetValues.forEach((facetValue) => {
      let applied = false;
      if (appliedFilters) {
        appliedFilters.forEach((appliedFilter) => {
          if (appliedFilter && facetValue.name && facetValue.name.toLowerCase() === appliedFilter.toLowerCase()) {
            applied = true;
          }
        });
      }
      facetValue.apply = applied;
      facetValue.count = NumberUtil.parseInt(facetValue.count);
    });
    return facetValues;
  }

  private mapFilterValues(filtersMap: SearchFilter, contentSearchCriteria: ContentSearchCriteria): ContentSearchFilter[] {
    const contentSearchFilters: ContentSearchFilter[] = [];
    const impliedFiltersMap: { [key: string]: any }[] = [];
    Object.keys(filtersMap).forEach(key => {
      const values = filtersMap[key];
      if (Array.isArray(values) && values.length) {
        const filterValues: FilterValue[] = [];
        values.forEach((value) => {
          const filterValue: FilterValue = {name: value, apply: true};
          filterValues.push(filterValue);
        });
        contentSearchFilters.push({name: key, values: filterValues});
      } else if (values) {
        const filterMap: { [key: string]: any } = {};
        filterMap[key] = values;
        impliedFiltersMap.push(filterMap);
      }
    });
    contentSearchCriteria.impliedFiltersMap = impliedFiltersMap;
    return contentSearchFilters;
  }

}
