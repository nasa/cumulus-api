## List collections

List collections in the Cumulus engine.

```endpoint
GET /collections
```

#### Example request

```curl
$ curl https://cumulus.developmentseed.org/api/dev/collections --header 'Authorization: TokenFromAuthorizationEndpoint'
```

#### Example response

```json
{
  "meta": {
    "name": "cumulus-api",
    "table": "cumulus-api-lpdaac-dev-CollectionsTable",
    "limit": 1,
    "page": 1,
    "count": 3
  },
  "results": [
    {
      "createdAt": 123123413214,
      "changedBy": "Cumulus Dashboard",
      "cmrProvider": "CUMULUS",
      "recipe": {
        "cmr": {
          "config": {}
        },
        "archive": {
          "config": {}
        },
        "processStep": {
          "description": "new-updated-value",
          "config": {
            "image": "asterProcessing",
            "outputFiles": [
              "processed-hdf5",
              "thumbnail-1",
              "meta-xml"
            ],
            "inputFiles": [
              "origin-hdf5",
              "origin-thumbnail"
            ]
          }
        },
        "order": [
          "processStep",
          "archive",
          "cmr"
        ]
      },
      "providers": [
        "LPDAAC_HTTP_MODIS"
      ],
      "collectionName": "AST_L1A__version__003",
      "granuleDefinition": {
        "granuleId": "^1A[\\d]{4}-[\\d]{10}_[\\d]{3}_[\\d]{3}$",
        "neededForProcessing": [
          "origin-hdf5",
          "origin-thumbnail"
        ],
        "sampleFileName": "pg-PR1A0000-2016121001_001_011",
        "files": {
          "origin-hdf5": {
            "regex": "^(pg-PR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
            "access": "private",
            "sampleFileName": "pg-PR1A0000-2016121001_000_001",
            "source": "sips"
          },
          "processed-hdf5": {
            "regex": "^AST_L1A_[\\d]*_[\\d]*\\.hdf$",
            "access": "protected",
            "sampleFileName": "AST_L1A_00301052017002700_02242017094829.hdf",
            "source": "cumulus"
          },
          "origin-thumbnail": {
            "regex": "^(pg-BR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
            "access": "private",
            "sampleFileName": "pg-BR1A0000-2016121001_000_001",
            "source": "sips"
          },
          "meta-xml": {
            "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
            "access": "protected",
            "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
            "source": "cumulus"
          },
          "thumbnail-2": {
            "regex": "^AST_L1A_[\\d]*_[\\d]*\\_2.jpg$",
            "access": "public",
            "sampleFileName": "AST_L1A_00301052017002700_02242017094829_2.jpg",
            "source": "cumulus"
          },
          "thumbnail-1": {
            "regex": "^AST_L1A_[\\d]*_[\\d]*\\_1.jpg$",
            "access": "public",
            "sampleFileName": "AST_L1A_00301052017002700_02242017094829_1.jpg",
            "source": "cumulus"
          },
          "thumbnail-3": {
            "regex": "^AST_L1A_[\\d]*_[\\d]*\\_3.jpg$",
            "access": "public",
            "sampleFileName": "AST_L1A_00301052017002700_02242017094829_3.jpg",
            "source": "cumulus"
          }
        },
        "granuleIdExtraction": "^pg-[P|B]R(1A.*)$"
      },
      "updatedAt": 1491926329531,
      "timestamp": "2017-04-11T15:58:50.839Z",
      "granulesStatus": {
        "ingesting": 0,
        "cmr": 0,
        "processing": 0,
        "completed": 26,
        "failed": 1,
        "archiving": 0
      },
      "averageDuration": 119.51745898907001,
      "granules": 27,
      "progress": 100
    }
  ]
}
```

## Retrieve collection

Retrieve a single collection.

```endpoint
GET /collections/{collectionName}
```

#### Example request

```curl
$ curl https://cumulus.developmentseed.org/api/dev/collections/AST_L1A__version__003 --header 'Authorization: TokenFromAuthorizationEndpoint'
```

#### Example response

```json
{
    "averageDuration": 119.51745898907001,
    "changedBy": "Cumulus Dashboard",
    "cmrProvider": "CUMULUS",
    "collectionName": "AST_L1A__version__003",
    "createdAt": 123123413214,
    "granuleDefinition": {
        "files": {
            "meta-xml": {
                "access": "protected",
                "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
                "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
                "source": "cumulus"
            },
            "origin-hdf5": {
                "access": "private",
                "regex": "^(pg-PR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
                "sampleFileName": "pg-PR1A0000-2016121001_000_001",
                "source": "sips"
            },
            "origin-thumbnail": {
                "access": "private",
                "regex": "^(pg-BR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
                "sampleFileName": "pg-BR1A0000-2016121001_000_001",
                "source": "sips"
            },
            "processed-hdf5": {
                "access": "protected",
                "regex": "^AST_L1A_[\\d]*_[\\d]*\\.hdf$",
                "sampleFileName": "AST_L1A_00301052017002700_02242017094829.hdf",
                "source": "cumulus"
            },
            "thumbnail-1": {
                "access": "public",
                "regex": "^AST_L1A_[\\d]*_[\\d]*\\_1.jpg$",
                "sampleFileName": "AST_L1A_00301052017002700_02242017094829_1.jpg",
                "source": "cumulus"
            },
            "thumbnail-2": {
                "access": "public",
                "regex": "^AST_L1A_[\\d]*_[\\d]*\\_2.jpg$",
                "sampleFileName": "AST_L1A_00301052017002700_02242017094829_2.jpg",
                "source": "cumulus"
            },
            "thumbnail-3": {
                "access": "public",
                "regex": "^AST_L1A_[\\d]*_[\\d]*\\_3.jpg$",
                "sampleFileName": "AST_L1A_00301052017002700_02242017094829_3.jpg",
                "source": "cumulus"
            }
        },
        "granuleId": "^1A[\\d]{4}-[\\d]{10}_[\\d]{3}_[\\d]{3}$",
        "granuleIdExtraction": "^pg-[P|B]R(1A.*)$",
        "neededForProcessing": [
            "origin-hdf5",
            "origin-thumbnail"
        ],
        "sampleFileName": "pg-PR1A0000-2016121001_001_011"
    },
    "granules": 27,
    "granulesStatus": {
        "archiving": 0,
        "cmr": 0,
        "completed": 26,
        "failed": 1,
        "ingesting": 0,
        "processing": 0
    },
    "progress": 100,
    "providers": [
        "LPDAAC_HTTP_MODIS"
    ],
    "recipe": {
        "archive": {
            "config": {}
        },
        "cmr": {
            "config": {}
        },
        "order": [
            "processStep",
            "archive",
            "cmr"
        ],
        "processStep": {
            "config": {
                "image": "asterProcessing",
                "inputFiles": [
                    "origin-hdf5",
                    "origin-thumbnail"
                ],
                "outputFiles": [
                    "processed-hdf5",
                    "thumbnail-1",
                    "meta-xml"
                ]
            },
            "description": "new-updated-value"
        }
    },
    "timestamp": "2017-04-11T15:58:50.839Z",
    "updatedAt": 1491926329531
}
```

## Create collection

Create a collection.

```endpoint
POST /collections
```

#### Example request

```curl
$ curl --request POST https://cumulus.developmentseed.org/api/dev/collections --header 'Authorization: Basic Y3VtdWx1czp0ZXN0dXNlcg==' --data '{
    "changedBy": "Jane Smith",
    "cmrProvider": "MY_DAAC",
    "collectionName": "MY_COLLECTION",
    "createdAt": 1491946535919,
    "granuleDefinition": {
        "files": {
            "foobar": {
                "_id": "foobar",
                "access": "private",
                "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
                "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
                "source": "sips"
            }
        },
        "granuleId": "^1A[\\d]{4}-[\\d]{10}_[\\d]{3}_[\\d]{3}$",
        "granuleIdExtraction": "^pg-[P|B]R(1A.*)$",
        "neededForProcessing": [
            "foobar"
        ],
        "sampleFileName": "pg-PR1A0000-2016121001_001_011"
    },
    "providers": [
        "MY_DAAC_SATELLITE"
    ],
    "recipe": {
        "order": [
            "archive"
        ],
        "processStep": {
            "config": {
                "image": "asterProcessing",
                "inputFiles": [
                    "foobar"
                ],
                "outputFiles": [
                    "foobar"
                ]
            }
        }
    },
    "updatedAt": 1491946535919
}'
```

#### Example response

```json
{
    "detail": "Record saved",
    "record": {
        "changedBy": "Jane Smith",
        "cmrProvider": "MY_DAAC",
        "collectionName": "MY_COLLECTION",
        "createdAt": 1491946535919,
        "granuleDefinition": {
            "files": {
                "foobar": {
                    "access": "private",
                    "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
                    "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
                    "source": "sips"
                }
            },
            "granuleId": "^1A[\\d]{4}-[\\d]{10}_[\\d]{3}_[\\d]{3}$",
            "granuleIdExtraction": "^pg-[P|B]R(1A.*)$",
            "neededForProcessing": [
                "foobar"
            ],
            "sampleFileName": "pg-PR1A0000-2016121001_001_011"
        },
        "providers": [
            "MY_DAAC_SATELLITE"
        ],
        "recipe": {
            "order": [
                "processStep",
                "archive",
                "cmr"
            ],
            "processStep": {
                "config": {
                    "image": "asterProcessing",
                    "inputFiles": [
                        "foobar"
                    ],
                    "outputFiles": [
                        "foobar"
                    ]
                }
            }
        },
        "updatedAt": 1491946697898
    }
}
```

## Update collection

Update values for a collection. Can accept a subset of the collection fields, or the whole collection object.

```endpoint
PUT /collections
```

#### Example request

```curl
$ curl --request PUT https://cumulus.developmentseed.org/api/dev/collections/MY_COLLECTION --header 'Authorization: TokenFromAuthorizationEndpoint' --data '{
    "providers": ["ANOTHER_PROVIDER"]
}'
```

#### Example response

```json
{
    "changedBy": "Jane Smith",
    "cmrProvider": "MY_DAAC",
    "collectionName": "MY_COLLECTION",
    "createdAt": 1491946535919,
    "granuleDefinition": {
        "files": {
            "foobar": {
                "access": "private",
                "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
                "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
                "source": "sips"
            }
        },
        "granuleId": "^1A[\\d]{4}-[\\d]{10}_[\\d]{3}_[\\d]{3}$",
        "granuleIdExtraction": "^pg-[P|B]R(1A.*)$",
        "neededForProcessing": [
            "foobar"
        ],
        "sampleFileName": "pg-PR1A0000-2016121001_001_011"
    },
    "providers": [
        "ANOTHER_PROVIDER"
    ],
    "recipe": {
        "order": [
            "processStep",
            "archive",
            "cmr"
        ],
        "processStep": {
            "config": {
                "image": "asterProcessing",
                "inputFiles": [
                    "foobar"
                ],
                "outputFiles": [
                    "foobar"
                ]
            }
        }
    },
    "updatedAt": 1491947364863
}
```

## Delete collection

Delete a collection from Cumulus, but not from CMR. All related granules in Cumulus must have already been deleted from Cumulus.

```endpoint
DELETE /collections/{collectionName}
```

#### Example request

```curl
$ curl --request DELETE https://cumulus.developmentseed.org/api/dev/collections/MY_COLLECTION --header 'Authorization: TokenFromAuthorizationEndpoint'

```

#### Example response

```json
{
  "detail": "Record deleted"
}
```
