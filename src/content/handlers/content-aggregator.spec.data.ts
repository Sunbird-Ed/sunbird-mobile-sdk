import {AggregatorConfigField} from './content-aggregator';

export const mockFormResponse = {
    'form': {
        'type': 'config',
        'subtype': 'library',
        'action': 'get',
        'component': 'app',
        'framework': '*',
        'data': {
            'templateName': 'library',
            'action': 'get',
            'fields': [
                {
                    dataSrc: {
                        type: 'CONTENTS',
                        request: {
                            type: 'POST',
                            path: '/api/content/v1/search',
                            withBearerToken: true,
                            body: {
                                request: {
                                    'facets': [
                                        'board',
                                        'medium',
                                        'gradeLevel',
                                        'subject',
                                        'channel'
                                    ],
                                    'fields': [],
                                    'filters': {
                                        'primaryCategory': [
                                            'Explanation Content'
                                        ],
                                        'additionalCategories': [
                                            'TV Lesson'
                                        ]
                                    }
                                }
                            } as any
                        },
                        mapping: []
                    },
                    sections: [
                        {
                            'index': 0,
                            'isEnabled': true,
                            'code': 'sample_code',
                            'title': '{"en":"TV classes","hi":"टीवी क्लासेस"}',
                            'description': '{"en":"TV classes","hi":"टीवी क्लासेस"}',
                            'theme': {
                                'component': 'sb-course-cards-hlist',
                                'inputs': {
                                    'type': 'course_card_grid',
                                    'hideProgress': true,
                                    'viewMoreButtonText': '{"en":"View all"}'
                                }
                            }
                        }
                    ]
                } as AggregatorConfigField<'CONTENTS'>,
                {
                    dataSrc: {
                        type: 'CONTENTS',
                        request: {
                            type: 'POST',
                            path: '/api/content/v1/search',
                            withBearerToken: true,
                            body: {
                                request: {
                                    'facets': [
                                        'board',
                                        'medium',
                                        'gradeLevel',
                                        'subject',
                                        'channel'
                                    ],
                                    'fields': [
                                        'identifier',
                                        'pkgVersion',
                                        'name',
                                        'appIcon',
                                        'subject',
                                        'medium',
                                        'board',
                                        'framework',
                                        'gradeLevel',
                                        'channel',
                                        'contentType',
                                        'mimeType',
                                        'resourceType',
                                        'status',
                                        'downloadUrl',
                                        'variants',
                                        'createdBy',
                                        'originData',
                                        'origin',
                                        'streamingUrl',
                                        'dialecodes',
                                        'size',
                                        'batches',
                                        'organisation',
                                        'primaryCategory',
                                        'trackable'
                                    ],
                                    'filters': {
                                        'primaryCategory': [
                                            'Digital Textbook'
                                        ]
                                    }
                                }
                            } as any
                        },
                        mapping: [
                            {
                                applyFirstAvailableCombination: true,
                                aggregate: {
                                    'groupBy': 'subject',
                                    'sortBy': [
                                        {
                                            'name': 'asc'
                                        }
                                    ]
                                }
                            }
                        ]
                    },
                    sections: [
                        {
                            'index': 1,
                            'title': '{"en":"Digital TextBook","hi":"डिजिटल टेक्स्टबुक"}',
                            'description': '{"en":"TV classes","hi":"टीवी क्लासेस"}',
                            'theme': {
                                'component': 'sb-course-cards-hlist',
                                'inputs': {
                                    'type': 'course_card_grid',
                                    'hideProgress': true,
                                    'viewMoreButtonText': '{"en":"View all"}'
                                }
                            }
                        }
                    ]
                } as AggregatorConfigField<'CONTENTS'>,
            ]
        },
        'created_on': '2020-08-26T15:11:56.149Z',
        'last_modified_on': null,
        'rootOrgId': '*'
    }
};

export const mockFormResponseWithExplicitContentFacetValues = {
    'form': {
        'type': 'config',
        'subtype': 'library',
        'action': 'get',
        'component': 'app',
        'framework': '*',
        'data': {
            'templateName': 'library',
            'action': 'get',
            'fields': [
                {
                    dataSrc: {
                        type: 'CONTENT_FACETS',
                        request: {},
                        'values': [
                            {
                                'facet': 'Digital Textbook',
                                'searchCriteria': {
                                    'facets': [],
                                    'primaryCategory': [
                                        'Digital Textbook'
                                    ],
                                    'mode': 'soft',
                                    'searchType': 'search'
                                },
                                'primaryFacetFilters': [
                                    {
                                        'code': 'board',
                                        'translations': '{"en":"Board/Syllabus","hi":"बोर्ड","te":"బోర్డు","ta":"வாரியம்","mr":"बोर्ड"}',
                                        'values': [],
                                        'name': 'Board/Syllabus',
                                        'index': 1
                                    },
                                    {
                                        'code': 'gradeLevel',
                                        'translations': '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                                        'values': [],
                                        'name': 'Class',
                                        'index': 2
                                    }
                                ],
                                'aggregate': {
                                    'groupBy': 'subject'
                                }
                            },
                            {
                                'facet': 'Courses',
                                'searchCriteria': {
                                    'facets': [],
                                    'primaryCategory': [
                                        'Course'
                                    ],
                                    'mode': 'soft',
                                    'searchType': 'search'
                                },
                                'primaryFacetFilters': [
                                    {
                                        'code': 'board',
                                        'translations': '{"en":"Board/Syllabus","hi":"बोर्ड","te":"బోర్డు","ta":"வாரியம்","mr":"बोर्ड"}',
                                        'values': [],
                                        'name': 'Board/Syllabus',
                                        'index': 1
                                    },
                                    {
                                        'code': 'gradeLevel',
                                        'translations': '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                                        'values': [],
                                        'name': 'Class',
                                        'index': 2
                                    }
                                ],
                                'aggregate': {
                                    'groupBy': 'subject'
                                }
                            },
                            {
                                'facet': 'Tv Classes',
                                'searchCriteria': {
                                    'facets': [],
                                    'primaryCategory': [
                                        'Explanation Content'
                                    ],
                                    'mode': 'soft',
                                    'searchType': 'search'
                                },
                                'primaryFacetFilters': [
                                    {
                                        'code': 'board',
                                        'translations': '{"en":"Board/Syllabus","hi":"बोर्ड","te":"బోర్డు","ta":"வாரியம்","mr":"बोर्ड"}',
                                        'values': [],
                                        'name': 'Board/Syllabus',
                                        'index': 1
                                    },
                                    {
                                        'code': 'gradeLevel',
                                        'translations': '{"en":"Class","hi":"कक्षा","te":"క్లాసు","ta":"வகுப்பு","mr":"इयत्ता"}',
                                        'values': [],
                                        'name': 'Class',
                                        'index': 2
                                    }
                                ],
                                'aggregate': {
                                    'groupBy': 'subject'
                                }
                            }
                        ] as any,
                        mapping: []
                    },
                    sections: [
                        {
                            'index': 0,
                            'isEnabled': true,
                            'code': 'sample_code',
                            'title': '{"en":"TV classes","hi":"टीवी क्लासेस"}',
                            'description': '{"en":"TV classes","hi":"टीवी क्लासेस"}',
                            'theme': {
                                'component': 'sb-course-cards-hlist',
                                'inputs': {
                                    'type': 'course_card_grid',
                                    'hideProgress': true,
                                    'viewMoreButtonText': '{"en":"View all"}'
                                }
                            }
                        }
                    ]
                } as AggregatorConfigField<'CONTENT_FACETS'>,
            ]
        },
        'created_on': '2020-08-26T15:11:56.149Z',
        'last_modified_on': null,
        'rootOrgId': '*'
    }
};

export const mockFormResponseWithDiscoveryBannerDataSrc = {
    'form': {
        'type': 'config',
        'subtype': 'library',
        'action': 'get',
        'component': 'app',
        'framework': '*',
        'data': {
            'templateName': 'library',
            'action': 'get',
            'fields': [
                {
                    'dataSrc': {
                        'type': 'CONTENT_DISCOVERY_BANNER',
                        'mapping': [],
                        'values': [
                            {
                                'code': 'banner_external_url',
                                'ui': {
                                    'background': 'https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_960_720.jpg',
                                    'text': 'Sample External Url'
                                },
                                'action': {
                                    'type': 'navigate',
                                    'subType': 'externalUrl',
                                    'params': {
                                        'route': 'https://diksha.gov.in/'
                                    }
                                },
                                'expiry': '1653031067'
                            },
                            {
                                'code': 'banner_internal_url',
                                'ui': {
                                    'background': 'https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_960_720.jpg',
                                    'text': 'Sample Internal Url'
                                },
                                'action': {
                                    'type': 'navigate',
                                    'subType': 'internalUrl',
                                    'params': {
                                        'route': 'profile'
                                    }
                                },
                                'expiry': '1653031067'
                            },
                            {
                                'code': 'banner_search',
                                'ui': {
                                    'background': 'https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_960_720.jpg',
                                    'text': 'Sample Search'
                                },
                                'action': {
                                    'type': 'navigate',
                                    'subType': 'search',
                                    'params': {
                                        'filter': {
                                            'offset': 0,
                                            'fields': [
                                                'subject'
                                            ],
                                            'facets': [
                                                'subject',
                                                'primaryCategory',
                                                'targetSubjectIds'
                                            ],
                                            'filters': {
                                                'audience': [],
                                                'objectType': [
                                                    'Content'
                                                ],
                                                'se_gradeLevels': [
                                                    'class 9',
                                                    'class 10',
                                                    'class 11',
                                                    'class 12'
                                                ],
                                                'se_mediums': [
                                                    'english'
                                                ],
                                                'se_boards': [
                                                    'state (tamil nadu)'
                                                ]
                                            },
                                            'exists': [],
                                            'sort_by': {}
                                        }
                                    }
                                },
                                'expiry': '1653031067'
                            },
                            {
                                'code': 'banner_content',
                                'ui': {
                                    'background': 'https://cdn.pixabay.com/photo/2015/10/29/14/38/web-1012467_960_720.jpg',
                                    'text': 'Sample content'
                                },
                                'action': {
                                    'type': 'navigate',
                                    'subType': 'content',
                                    'params': {
                                        'identifier': 'do_21302358976737280014'
                                    }
                                },
                                'expiry': '1653031067'
                            }
                        ]
                    },
                    'sections': [
                        {
                            'index': 1,
                            'code': '',
                            'isEnabled': false,
                            'title': '{\'en\':\'Discovery Banner\'}',
                            'theme': {
                                'component': 'sb-library-cards-hlist',
                                'inputs': {
                                    'type': 'mobile_textbook',
                                    'viewMoreButtonText': '{\'en\':\'View all\'}',
                                    'maxCardCount': 10,
                                    'viewMoreButtonPosition': 'right'
                                }
                            }
                        }
                    ]
                }  as AggregatorConfigField<'CONTENT_DISCOVERY_BANNER'>
            ]
        },
        'created_on': '2020-08-26T15:11:56.149Z',
        'last_modified_on': null,
        'rootOrgId': '*'
    }
};

export const mockFormResponseWithTrackableCollectionsDataSrc = {
    'form': {
        'type': 'config',
        'subtype': 'library',
        'action': 'get',
        'component': 'app',
        'framework': '*',
        'data': {
            'templateName': 'library',
            'action': 'get',
            'fields': [
                {
                    'dataSrc': {
                        'type': 'TRACKABLE_COLLECTIONS',
                        'request': {
                            'type': 'GET',
                            'path': '/api/course/v1/user/enrollment/list/${userId}',
                            'parameters': {
                                'orgdetails': 'orgName,email',
                                'fields': 'contentType,topic,name,channel,pkgVersion,primaryCategory,trackable',
                                'batchDetails': 'name,endDate,startDate,status,enrollmentType,createdBy,certificates'
                            },
                            'withBearerToken': true,
                            'withUserToken': true
                        },
                        'mapping': [
                            {
                                aggregate: {
                                    filterBy: [
                                        {
                                            'content.primaryCategory': {
                                              'operation': '==',
                                              'value': 'Course'
                                            }
                                        } as any
                                    ]
                                }
                            }
                        ],
                    },
                    'sections': [
                        {
                            'index': 0,
                            'isEnabled': true,
                            'code': 'sample_code',
                            'title': '{"en":"TV Programs","hi":"टीवी कार्यक्रम"}',
                            'description': '{"en":"TV classes","hi":"टीवी क्लासेस"}',
                            'theme': {
                                'orientation': 'horizontal',
                            }
                        }
                    ]
                } as AggregatorConfigField<'TRACKABLE_COLLECTIONS'>,
            ]
        },
        'created_on': '2020-08-26T15:11:56.149Z',
        'last_modified_on': null,
        'rootOrgId': '*'
    }
};

export const mockFormResponseWithTrackableCollectionsDataSrcAndNoFilter = {
    'form': {
        'type': 'config',
        'subtype': 'library',
        'action': 'get',
        'component': 'app',
        'framework': '*',
        'data': {
            'templateName': 'library',
            'action': 'get',
            'fields': [
                {
                    'dataSrc': {
                        'type': 'TRACKABLE_COLLECTIONS',
                        'request': {
                            'type': 'GET',
                            'path': '/api/course/v1/user/enrollment/list/${userId}',
                            'parameters': {
                                'orgdetails': 'orgName,email',
                                'fields': 'contentType,topic,name,channel,pkgVersion,primaryCategory,trackable',
                                'batchDetails': 'name,endDate,startDate,status,enrollmentType,createdBy,certificates'
                            },
                            'withBearerToken': true,
                            'withUserToken': true
                        },
                        'mapping': [
                        ],
                    },
                    'sections': [
                        {
                            'index': 0,
                            'isEnabled': true,
                            'code': 'sample_code',
                            'title': '{"en":"TV Programs","hi":"टीवी कार्यक्रम"}',
                            'description': '{"en":"TV classes","hi":"टीवी क्लासेस"}',
                            'theme': {
                                'orientation': 'horizontal',
                            }
                        }
                    ]
                } as AggregatorConfigField<'TRACKABLE_COLLECTIONS'>,
            ]
        },
        'created_on': '2020-08-26T15:11:56.149Z',
        'last_modified_on': null,
        'rootOrgId': '*'
    }
};

export const mockFormResponseWithUnknownDataSrc = {
    'form': {
        'type': 'config',
        'subtype': 'library',
        'action': 'get',
        'component': 'app',
        'framework': '*',
        'data': {
            'templateName': 'library',
            'action': 'get',
            'fields': [
                {
                    dataSrc: {
                        type: 'CONTENTS',
                        request: {
                            type: 'POST',
                            path: '/api/content/v1/search',
                            withBearerToken: true,
                            body: {
                                request: {
                                    'facets': [
                                        'board',
                                        'medium',
                                        'gradeLevel',
                                        'subject',
                                        'channel'
                                    ],
                                    'fields': [],
                                    'filters': {
                                        'primaryCategory': [
                                            'Explanation Content'
                                        ],
                                        'additionalCategories': [
                                            'TV Lesson'
                                        ]
                                    }
                                }
                            } as any
                        },
                        mapping: []
                    },
                    sections: [
                        {
                            'index': 0,
                            'isEnabled': true,
                            'code': 'sample_code',
                            'title': '{"en":"TV classes","hi":"टीवी क्लासेस"}',
                            'description': '{"en":"TV classes","hi":"टीवी क्लासेस"}',
                            'theme': {
                                'component': 'sb-course-cards-hlist',
                                'inputs': {
                                    'type': 'course_card_grid',
                                    'hideProgress': true,
                                    'viewMoreButtonText': '{"en":"View all"}'
                                }
                            }
                        }
                    ]
                } as AggregatorConfigField<'CONTENTS'>,
                {
                    'dataSrc': {
                        'name': 'UNKNOWN_DATA_SRC',
                    }
                },
            ]
        },
        'created_on': '2020-08-26T15:11:56.149Z',
        'last_modified_on': null,
        'rootOrgId': '*'
    }
};

export const mockGetOfflineContentsResponse = [
    {
        contentData: {
            'ownershipType': [
                'createdBy'
            ],
            'copyright': '345 org, Sunbird QA Tenant, SunbirdQA 3',
            'subject': 'Physical Science',
            'channel': '0124511394914140160',
            'organisation': [
                '345 org',
                'Sunbird QA Tenant',
                'SunbirdQA 3'
            ],
            'language': [
                'English'
            ],
            'mimeType': 'application/vnd.ekstep.content-collection',
            'objectType': 'Content',
            'appIcon': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21280780867130982412259/artifact/download_1562667557939.thumb.jpeg',
            'gradeLevel': [
                'Class 1'
            ],
            'appId': 'staging.diksha.portal',
            'contentEncoding': 'gzip',
            'lockKey': '9497b6ba-2a74-41cf-bf72-cdd0d117cde4',
            'totalCompressedSize': 0,
            'mimeTypesCount': '{"application/vnd.ekstep.content-collection":1}',
            'contentType': 'TextBook',
            'identifier': 'do_21280780867130982412259',
            'audience': [
                'Learner'
            ],
            'visibility': 'Default',
            'contentTypesCount': '{"TextBookUnit":1}',
            'childNodes': [
                'do_21280780875931648012260'
            ],
            'consumerId': 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
            'mediaType': 'content',
            'osId': 'org.ekstep.quiz.app',
            'lastPublishedBy': '00c3affc-6988-4b38-9d61-c7bd23ac6cec',
            'graph_id': 'domain',
            'nodeType': 'DATA_NODE',
            'version': 2,
            'license': 'CC BY 4.0',
            'prevState': 'Review',
            'size': 6840,
            'lastPublishedOn': '2019-07-18T12:34:22.637+0000',
            'name': '111 Book',
            'status': 'Live',
            'code': 'org.sunbird.l5OJ7O',
            'description': 'Enter description for TextBook',
            'medium': 'English',
            'idealScreenSize': 'normal',
            'createdOn': '2019-07-18T12:33:26.946+0000',
            'copyrightYear': 2019,
            'contentDisposition': 'inline',
            'lastUpdatedOn': '2019-07-18T12:34:22.457+0000',
            'SYS_INTERNAL_LAST_UPDATED_ON': '2019-07-18T12:34:22.769+0000',
            'dialcodeRequired': 'No',
            'lastStatusChangedOn': '2019-07-18T12:34:22.761+0000',
            'createdFor': [
                '0124511394914140160',
                '01245114878763827244',
                '01231711180382208027'
            ],
            'creator': 'Book Creator',
            'os': [
                'All'
            ],
            'pkgVersion': 1,
            'versionKey': '1563453262457',
            'idealScreenDensity': 'hdpi',
            'depth': 0,
            'framework': 'ap_k-12_1',
            'lastSubmittedOn': '2019-07-18T12:33:57.859+0000',
            'createdBy': '25827334-616f-41fc-bc13-b4a1b0b4d7f5',
            'leafNodesCount': 0,
            'compatibilityLevel': 1,
            'board': 'State (Andhra Pradesh)',
            'resourceType': 'Book',
            'node_id': 98321
        }
    }
];

export const mockGetOnlineContentsResponse = {
    contentDataList: [{
        'ownershipType': [
            'createdBy'
        ],
        'copyright': 'Abhi',
        'keywords': [
            'teacher',
            'Test',
            'student'
        ],
        'year': '2004',
        'subject': 'English',
        'channel': '012830253834911744102',
        'organisation': [
            'TN2.3'
        ],
        'language': [
            'English'
        ],
        'mimeType': 'application/vnd.ekstep.content-collection',
        'leafNodes': [
            'do_2126025437863280641611',
            'do_2126138215303577601484',
            'do_2128267047888322561514'
        ],
        'objectType': 'Content',
        'appIcon': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_2128458593096499201172/artifact/_turtle__1549009838461.thumb.jpg',
        'gradeLevel': [
            'Class 1',
            'Class 6',
            'Class 7',
            'Class 8'
        ],
        'children': [
            'do_2126025437863280641611',
            'do_2128267047888322561514',
            'do_2126138215303577601484'
        ],
        'appId': 'staging.diksha.portal',
        'contentEncoding': 'gzip',
        'lockKey': 'ccb9c713-3a2d-4db4-9474-58df071f2133',
        'totalCompressedSize': 3565898,
        'mimeTypesCount': '{"video/webm":1,"application/vnd.ekstep.content-collection":1,"application/vnd.ekstep.ecml-archive":2}',
        'contentCredits': '[{"id":"644da49c-7bef-49d6-8e24-e741d148d652","name":"1.10Creator User","type":"user"}]',
        'contentType': 'TextBook',
        'lastUpdatedBy': '019374bc-e6f2-4bf4-be7d-7895c41d760f',
        'identifier': 'do_2128458593096499201172',
        'audience': [
            'Learner'
        ],
        'toc_url': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_2128458593096499201172/artifact/do_2128458593096499201172_toc.json',
        'visibility': 'Default',
        'contentTypesCount': '{"TextBookUnit":1,"Resource":3}',
        'author': 'Abhinav',
        'childNodes': [
            'do_2126025437863280641611',
            'do_2126138215303577601484',
            'do_2128458595760619521173',
            'do_2128267047888322561514'
        ],
        'consumerId': 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
        'mediaType': 'content',
        'osId': 'org.ekstep.quiz.app',
        'lastPublishedBy': '8feb8c9d-0628-436b-b12d-8fc775dcf3c9',
        'graph_id': 'domain',
        'nodeType': 'DATA_NODE',
        'version': 2,
        'license': 'CC BY 4.0',
        'prevState': 'Review',
        'qrCodeProcessId': '4f885002-ef00-4f56-84b7-58e29f4ea0f2',
        'lastPublishedOn': '2019-09-10T06:57:14.392+0000',
        'size': 927997,
        'name': 'Ab16',
        'publisher': 'Ab',
        'attributions': [
            'Ab'
        ],
        'status': 'Live',
        'code': 'org.sunbird.PhOPHg',
        'description': '12345',
        'medium': 'English',
        'posterImage': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21268948859484569611537/artifact/_turtle__1549009838461.jpg',
        'idealScreenSize': 'normal',
        'createdOn': '2019-09-10T06:47:40.260+0000',
        'reservedDialcodes': '{"M3X5X1":0,"G4U3F5":1}',
        'copyrightYear': 2019,
        'contentDisposition': 'inline',
        'lastUpdatedOn': '2019-09-10T06:57:14.111+0000',
        'SYS_INTERNAL_LAST_UPDATED_ON': '2019-09-10T06:57:14.868+0000',
        'dialcodeRequired': 'No',
        'lastStatusChangedOn': '2019-09-10T06:57:14.854+0000',
        'createdFor': [
            '012830253834911744102'
        ],
        'creator': '2.3 Book Creator',
        'os': [
            'All'
        ],
        'pkgVersion': 1,
        'versionKey': '1568098634111',
        'idealScreenDensity': 'hdpi',
        'depth': 0,
        'framework': 'ap_k-12_13',
        'lastSubmittedOn': '2019-09-10T06:51:33.229+0000',
        'createdBy': '019374bc-e6f2-4bf4-be7d-7895c41d760f',
        'leafNodesCount': 3,
        'compatibilityLevel': 1,
        'board': 'State (Andhra Pradesh)',
        'resourceType': 'Book',
        'node_id': 521527
    }],
    'filterCriteria': {
        'facetFilters': [{'name': 'subject', 'values':[{'name': 'English', 'count': 3}, {'name': 'Accountancy', 'count': 13}]}] 
    }
};

export const mockGetOfflineContentsResponseWithTwoSubjects = [
    {
        contentData: {
            'ownershipType': [
                'createdBy'
            ],
            'copyright': '345 org, Sunbird QA Tenant, SunbirdQA 3',
            'subject': 'Physical Science',
            'channel': '0124511394914140160',
            'organisation': [
                '345 org',
                'Sunbird QA Tenant',
                'SunbirdQA 3'
            ],
            'language': [
                'English'
            ],
            'mimeType': 'application/vnd.ekstep.content-collection',
            'objectType': 'Content',
            'appIcon': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21280780867130982412259/artifact/download_1562667557939.thumb.jpeg',
            'gradeLevel': [
                'Class 1'
            ],
            'appId': 'staging.diksha.portal',
            'contentEncoding': 'gzip',
            'lockKey': '9497b6ba-2a74-41cf-bf72-cdd0d117cde4',
            'totalCompressedSize': 0,
            'mimeTypesCount': '{"application/vnd.ekstep.content-collection":1}',
            'contentType': 'TextBook',
            'identifier': 'do_21280780867130982412259',
            'audience': [
                'Learner'
            ],
            'visibility': 'Default',
            'contentTypesCount': '{"TextBookUnit":1}',
            'childNodes': [
                'do_21280780875931648012260'
            ],
            'consumerId': 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
            'mediaType': 'content',
            'osId': 'org.ekstep.quiz.app',
            'lastPublishedBy': '00c3affc-6988-4b38-9d61-c7bd23ac6cec',
            'graph_id': 'domain',
            'nodeType': 'DATA_NODE',
            'version': 2,
            'license': 'CC BY 4.0',
            'prevState': 'Review',
            'size': 6840,
            'lastPublishedOn': '2019-07-18T12:34:22.637+0000',
            'name': '111 Book',
            'status': 'Live',
            'code': 'org.sunbird.l5OJ7O',
            'description': 'Enter description for TextBook',
            'medium': 'English',
            'idealScreenSize': 'normal',
            'createdOn': '2019-07-18T12:33:26.946+0000',
            'copyrightYear': 2019,
            'contentDisposition': 'inline',
            'lastUpdatedOn': '2019-07-18T12:34:22.457+0000',
            'SYS_INTERNAL_LAST_UPDATED_ON': '2019-07-18T12:34:22.769+0000',
            'dialcodeRequired': 'No',
            'lastStatusChangedOn': '2019-07-18T12:34:22.761+0000',
            'createdFor': [
                '0124511394914140160',
                '01245114878763827244',
                '01231711180382208027'
            ],
            'creator': 'Book Creator',
            'os': [
                'All'
            ],
            'pkgVersion': 1,
            'versionKey': '1563453262457',
            'idealScreenDensity': 'hdpi',
            'depth': 0,
            'framework': 'ap_k-12_1',
            'lastSubmittedOn': '2019-07-18T12:33:57.859+0000',
            'createdBy': '25827334-616f-41fc-bc13-b4a1b0b4d7f5',
            'leafNodesCount': 0,
            'compatibilityLevel': 1,
            'board': 'State (Andhra Pradesh)',
            'resourceType': 'Book',
            'node_id': 98321
        }
    },
    {
        contentData: {
            'ownershipType': [
                'createdBy'
            ],
            'copyright': '345 org, Sunbird QA Tenant, SunbirdQA 3',
            'subject': 'Some other Physical Science',
            'channel': '0124511394914140160',
            'organisation': [
                '345 org',
                'Sunbird QA Tenant',
                'SunbirdQA 3'
            ],
            'language': [
                'English'
            ],
            'mimeType': 'application/vnd.ekstep.content-collection',
            'objectType': 'Content',
            'appIcon': 'https://ntpstagingall.blob.core.windows.net/ntp-content-staging/content/do_21280780867130982412259/artifact/download_1562667557939.thumb.jpeg',
            'gradeLevel': [
                'Class 1'
            ],
            'appId': 'staging.diksha.portal',
            'contentEncoding': 'gzip',
            'lockKey': '9497b6ba-2a74-41cf-bf72-cdd0d117cde4',
            'totalCompressedSize': 0,
            'mimeTypesCount': '{"application/vnd.ekstep.content-collection":1}',
            'contentType': 'TextBook',
            'identifier': 'some_other_do_21280780867130982412259',
            'audience': [
                'Learner'
            ],
            'visibility': 'Default',
            'contentTypesCount': '{"TextBookUnit":1}',
            'childNodes': [
                'do_21280780875931648012260'
            ],
            'consumerId': 'a9cb3a83-a164-4bf0-aa49-b834cebf1c07',
            'mediaType': 'content',
            'osId': 'org.ekstep.quiz.app',
            'lastPublishedBy': '00c3affc-6988-4b38-9d61-c7bd23ac6cec',
            'graph_id': 'domain',
            'nodeType': 'DATA_NODE',
            'version': 2,
            'license': 'CC BY 4.0',
            'prevState': 'Review',
            'size': 6840,
            'lastPublishedOn': '2019-07-18T12:34:22.637+0000',
            'name': '111 Book',
            'status': 'Live',
            'code': 'org.sunbird.l5OJ7O',
            'description': 'Enter description for TextBook',
            'medium': 'English',
            'idealScreenSize': 'normal',
            'createdOn': '2019-07-18T12:33:26.946+0000',
            'copyrightYear': 2019,
            'contentDisposition': 'inline',
            'lastUpdatedOn': '2019-07-18T12:34:22.457+0000',
            'SYS_INTERNAL_LAST_UPDATED_ON': '2019-07-18T12:34:22.769+0000',
            'dialcodeRequired': 'No',
            'lastStatusChangedOn': '2019-07-18T12:34:22.761+0000',
            'createdFor': [
                '0124511394914140160',
                '01245114878763827244',
                '01231711180382208027'
            ],
            'creator': 'Book Creator',
            'os': [
                'All'
            ],
            'pkgVersion': 1,
            'versionKey': '1563453262457',
            'idealScreenDensity': 'hdpi',
            'depth': 0,
            'framework': 'ap_k-12_1',
            'lastSubmittedOn': '2019-07-18T12:33:57.859+0000',
            'createdBy': '25827334-616f-41fc-bc13-b4a1b0b4d7f5',
            'leafNodesCount': 0,
            'compatibilityLevel': 1,
            'board': 'State (Andhra Pradesh)',
            'resourceType': 'Book',
            'node_id': 98321
        }
    }
];
