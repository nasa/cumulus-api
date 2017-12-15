## List granules

List granules in the Cumulus system.

```endpoint
GET /granules
```

#### Example request

```curl
$ curl https://example.com/granules --header 'Authorization: Basic Base64EncodedCredentials'
```

#### Example response

```json
{
  "meta": {
    "name": "cumulus-api",
    "table": "cumulus-api-lpdaac-dev-GranulesTable",
    "limit": 1,
    "page": 1,
    "count": 36
  },
  "results": [
    {
      "pdrName": "good_25grans.PDR",
      "createdAt": 1491926376632,
      "granuleId": "1A0000-2016121001_002_001",
      "provider": "LPDAAC_HTTP_MODIS",
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
      "files": {
        "origin-hdf5": {
          "regex": "^(pg-PR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
          "access": "private",
          "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-PR1A0000-2016121001_002_001",
          "size": 116495663,
          "sampleFileName": "pg-PR1A0000-2016121001_000_001",
          "name": "pg-PR1A0000-2016121001_002_001",
          "source": "sips",
          "stagingFile": "s3://cumulus-internal/staging/pg-PR1A0000-2016121001_002_001",
          "archivedFile": "s3://cumulus-private/pg-PR1A0000-2016121001_002_001"
        },
        "processed-hdf5": {
          "regex": "^AST_L1A_[\\d]*_[\\d]*\\.hdf$",
          "access": "protected",
          "sampleFileName": "AST_L1A_00301052017002700_02242017094829.hdf",
          "source": "cumulus",
          "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.hdf",
          "name": "AST_L1A_00312092016105058_04112017185932.hdf",
          "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.hdf"
        },
        "origin-thumbnail": {
          "regex": "^(pg-BR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
          "access": "private",
          "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-BR1A0000-2016121001_002_001",
          "size": 165916,
          "sampleFileName": "pg-BR1A0000-2016121001_000_001",
          "name": "pg-BR1A0000-2016121001_002_001",
          "source": "sips",
          "stagingFile": "s3://cumulus-internal/staging/pg-BR1A0000-2016121001_002_001",
          "archivedFile": "s3://cumulus-private/pg-BR1A0000-2016121001_002_001"
        },
        "meta-xml": {
          "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
          "access": "protected",
          "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
          "source": "cumulus",
          "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.xml",
          "name": "AST_L1A_00312092016105058_04112017185932.xml",
          "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.xml"
        },
        "thumbnail-2": {
          "regex": "^AST_L1A_[\\d]*_[\\d]*\\_2.jpg$",
          "access": "public",
          "sampleFileName": "AST_L1A_00301052017002700_02242017094829_2.jpg",
          "source": "cumulus",
          "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
          "name": "AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
          "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_SWIR.jpg"
        },
        "thumbnail-1": {
          "regex": "^AST_L1A_[\\d]*_[\\d]*\\_1.jpg$",
          "access": "public",
          "sampleFileName": "AST_L1A_00301052017002700_02242017094829_1.jpg",
          "source": "cumulus",
          "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
          "name": "AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
          "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_VNIR.jpg"
        },
        "thumbnail-3": {
          "regex": "^AST_L1A_[\\d]*_[\\d]*\\_3.jpg$",
          "access": "public",
          "sampleFileName": "AST_L1A_00301052017002700_02242017094829_3.jpg",
          "source": "cumulus",
          "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_TIR.jpg",
          "name": "AST_L1A_00312092016105058_04112017185932_TIR.jpg",
          "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_TIR.jpg"
        }
      },
      "ingestStartedAt": 1491926376632,
      "published": true,
      "collectionName": "AST_L1A__version__003",
      "status": "failed",
      "updatedAt": 1491949303621,
      "timestamp": "2017-04-11T22:21:43.273Z",
      "ingestEndedAt": 1491926743852,
      "ingestDuration": 0,
      "timeline": {
        "cmr": {
          "startedAt": 1491937190010,
          "endedAt": 1491926764500
        },
        "archive": {
          "startedAt": 1491937173781,
          "endedAt": 1491937190010
        },
        "processStep": {
          "startedAt": 1491937126577,
          "endedAt": 1491937173781
        }
      },
      "processingStartedAt": 1491937124060,
      "processStepDuration": 47.204,
      "archiveDuration": 16.229,
      "processingEndedAt": 1491926764500,
      "duration": 10.159,
      "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1219413874-LPCUMULUS",
      "totalDuration": 19.809,
      "cmrDuration": 1.364,
      "processingDuration": 10.159,
      "errorType": "processing",
      "error": "\"The granule did not complete or fail for at least 200 minutes\""
    }
  ]
}
```

## Retrieve granule

Retrieve a single granule.

```endpoint
GET /granules/{granuleID}
```

#### Example request

```curl
$ curl https://example.com/granules/1A0000-2016121001_002_001 --header 'Authorization: Basic Base64EncodedCredentials'
```

#### Example response

```json
{
  "pdrName": "good_25grans.PDR",
  "createdAt": 1491926376632,
  "granuleId": "1A0000-2016121001_002_001",
  "provider": "LPDAAC_HTTP_MODIS",
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
  "files": {
    "origin-hdf5": {
      "regex": "^(pg-PR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
      "access": "private",
      "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-PR1A0000-2016121001_002_001",
      "size": 116495663,
      "sampleFileName": "pg-PR1A0000-2016121001_000_001",
      "name": "pg-PR1A0000-2016121001_002_001",
      "source": "sips",
      "stagingFile": "s3://cumulus-internal/staging/pg-PR1A0000-2016121001_002_001",
      "archivedFile": "s3://cumulus-private/pg-PR1A0000-2016121001_002_001"
    },
    "processed-hdf5": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\.hdf$",
      "access": "protected",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829.hdf",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.hdf",
      "name": "AST_L1A_00312092016105058_04112017185932.hdf",
      "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.hdf"
    },
    "origin-thumbnail": {
      "regex": "^(pg-BR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
      "access": "private",
      "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-BR1A0000-2016121001_002_001",
      "size": 165916,
      "sampleFileName": "pg-BR1A0000-2016121001_000_001",
      "name": "pg-BR1A0000-2016121001_002_001",
      "source": "sips",
      "stagingFile": "s3://cumulus-internal/staging/pg-BR1A0000-2016121001_002_001",
      "archivedFile": "s3://cumulus-private/pg-BR1A0000-2016121001_002_001"
    },
    "meta-xml": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
      "access": "protected",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.xml",
      "name": "AST_L1A_00312092016105058_04112017185932.xml",
      "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.xml"
    },
    "thumbnail-2": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_2.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_2.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_SWIR.jpg"
    },
    "thumbnail-1": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_1.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_1.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_VNIR.jpg"
    },
    "thumbnail-3": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_3.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_3.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_TIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_TIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_TIR.jpg"
    }
  },
  "ingestStartedAt": 1491926376632,
  "published": true,
  "collectionName": "AST_L1A__version__003",
  "status": "failed",
  "updatedAt": 1491949303621,
  "timestamp": "2017-04-11T22:21:43.273Z",
  "ingestEndedAt": 1491926743852,
  "ingestDuration": 0,
  "timeline": {
    "cmr": {
      "startedAt": 1491937190010,
      "endedAt": 1491926764500
    },
    "archive": {
      "startedAt": 1491937173781,
      "endedAt": 1491937190010
    },
    "processStep": {
      "startedAt": 1491937126577,
      "endedAt": 1491937173781
    }
  },
  "processingStartedAt": 1491937124060,
  "processStepDuration": 47.204,
  "archiveDuration": 16.229,
  "processingEndedAt": 1491926764500,
  "duration": 10.159,
  "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1219413874-LPCUMULUS",
  "totalDuration": 19.809,
  "cmrDuration": 1.364,
  "processingDuration": 10.159,
  "errorType": "processing",
  "error": "\"The granule did not complete or fail for at least 200 minutes\""
}
```

## Reprocess granule

Reprocess a granule. This causes the granule to begin processing from scratch, using the file already downloaded by Cumulus.

```endpoint
PUT /granules/{granuleID}
```

#### Example request

```curl
$ curl --request PUT https://example.com/granules/1A0000-2016121001_002_001 --header 'Authorization: Basic Base64EncodedCredentials' --data '{"action": "reprocess"}'
```

#### Example response

```json
{
  "pdrName": "good_25grans.PDR",
  "createdAt": 1491926376632,
  "granuleId": "1A0000-2016121001_002_001",
  "provider": "LPDAAC_HTTP_MODIS",
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
  "files": {
    "origin-hdf5": {
      "regex": "^(pg-PR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
      "access": "private",
      "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-PR1A0000-2016121001_002_001",
      "size": 116495663,
      "sampleFileName": "pg-PR1A0000-2016121001_000_001",
      "name": "pg-PR1A0000-2016121001_002_001",
      "source": "sips",
      "stagingFile": "s3://cumulus-internal/staging/pg-PR1A0000-2016121001_002_001",
      "archivedFile": "s3://cumulus-private/pg-PR1A0000-2016121001_002_001"
    },
    "processed-hdf5": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\.hdf$",
      "access": "protected",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829.hdf",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.hdf",
      "name": "AST_L1A_00312092016105058_04112017185932.hdf",
      "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.hdf"
    },
    "origin-thumbnail": {
      "regex": "^(pg-BR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
      "access": "private",
      "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-BR1A0000-2016121001_002_001",
      "size": 165916,
      "sampleFileName": "pg-BR1A0000-2016121001_000_001",
      "name": "pg-BR1A0000-2016121001_002_001",
      "source": "sips",
      "stagingFile": "s3://cumulus-internal/staging/pg-BR1A0000-2016121001_002_001",
      "archivedFile": "s3://cumulus-private/pg-BR1A0000-2016121001_002_001"
    },
    "meta-xml": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
      "access": "protected",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.xml",
      "name": "AST_L1A_00312092016105058_04112017185932.xml",
      "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.xml"
    },
    "thumbnail-2": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_2.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_2.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_SWIR.jpg"
    },
    "thumbnail-1": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_1.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_1.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_VNIR.jpg"
    },
    "thumbnail-3": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_3.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_3.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_TIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_TIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_TIR.jpg"
    }
  },
  "ingestStartedAt": 1491926376632,
  "published": true,
  "collectionName": "AST_L1A__version__003",
  "status": "failed",
  "updatedAt": 1491949303621,
  "timestamp": "2017-04-11T22:21:43.273Z",
  "ingestEndedAt": 1491926743852,
  "ingestDuration": 0,
  "timeline": {
    "cmr": {
      "startedAt": 1491937190010,
      "endedAt": 1491926764500
    },
    "archive": {
      "startedAt": 1491937173781,
      "endedAt": 1491937190010
    },
    "processStep": {
      "startedAt": 1491937126577,
      "endedAt": 1491937173781
    }
  },
  "processingStartedAt": 1491937124060,
  "processStepDuration": 47.204,
  "archiveDuration": 16.229,
  "processingEndedAt": 1491926764500,
  "duration": 10.159,
  "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1219413874-LPCUMULUS",
  "totalDuration": 19.809,
  "cmrDuration": 1.364,
  "processingDuration": 10.159,
  "errorType": "processing",
  "error": "\"The granule did not complete or fail for at least 200 minutes\""
}
```

## Reingest granule

Reingest a granule. This causes the granule to re-download to Cumulus from source, and begin processing from scratch.

```endpoint
PUT /granules/{granuleID}
```

#### Example request

```curl
$ curl --request PUT https://example.com/granules/1A0000-2016121001_002_001 --header 'Authorization: Basic Base64EncodedCredentials' --data '{"action": "reingest"}'
```

#### Example response

```json
{
  "pdrName": "good_25grans.PDR",
  "createdAt": 1491926376632,
  "granuleId": "1A0000-2016121001_002_001",
  "provider": "LPDAAC_HTTP_MODIS",
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
  "files": {
    "origin-hdf5": {
      "regex": "^(pg-PR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
      "access": "private",
      "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-PR1A0000-2016121001_002_001",
      "size": 116495663,
      "sampleFileName": "pg-PR1A0000-2016121001_000_001",
      "name": "pg-PR1A0000-2016121001_002_001",
      "source": "sips",
      "stagingFile": "s3://cumulus-internal/staging/pg-PR1A0000-2016121001_002_001",
      "archivedFile": "s3://cumulus-private/pg-PR1A0000-2016121001_002_001"
    },
    "processed-hdf5": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\.hdf$",
      "access": "protected",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829.hdf",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.hdf",
      "name": "AST_L1A_00312092016105058_04112017185932.hdf",
      "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.hdf"
    },
    "origin-thumbnail": {
      "regex": "^(pg-BR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
      "access": "private",
      "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-BR1A0000-2016121001_002_001",
      "size": 165916,
      "sampleFileName": "pg-BR1A0000-2016121001_000_001",
      "name": "pg-BR1A0000-2016121001_002_001",
      "source": "sips",
      "stagingFile": "s3://cumulus-internal/staging/pg-BR1A0000-2016121001_002_001",
      "archivedFile": "s3://cumulus-private/pg-BR1A0000-2016121001_002_001"
    },
    "meta-xml": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
      "access": "protected",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.xml",
      "name": "AST_L1A_00312092016105058_04112017185932.xml",
      "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.xml"
    },
    "thumbnail-2": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_2.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_2.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_SWIR.jpg"
    },
    "thumbnail-1": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_1.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_1.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_VNIR.jpg"
    },
    "thumbnail-3": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_3.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_3.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_TIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_TIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_TIR.jpg"
    }
  },
  "ingestStartedAt": 1491926376632,
  "published": true,
  "collectionName": "AST_L1A__version__003",
  "status": "failed",
  "updatedAt": 1491949303621,
  "timestamp": "2017-04-11T22:21:43.273Z",
  "ingestEndedAt": 1491926743852,
  "ingestDuration": 0,
  "timeline": {
    "cmr": {
      "startedAt": 1491937190010,
      "endedAt": 1491926764500
    },
    "archive": {
      "startedAt": 1491937173781,
      "endedAt": 1491937190010
    },
    "processStep": {
      "startedAt": 1491937126577,
      "endedAt": 1491937173781
    }
  },
  "processingStartedAt": 1491937124060,
  "processStepDuration": 47.204,
  "archiveDuration": 16.229,
  "processingEndedAt": 1491926764500,
  "duration": 10.159,
  "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1219413874-LPCUMULUS",
  "totalDuration": 19.809,
  "cmrDuration": 1.364,
  "processingDuration": 10.159,
  "errorType": "processing",
  "error": "\"The granule did not complete or fail for at least 200 minutes\""
}
```

## Remove granule

Remove a Cumulus granule from CMR.

```endpoint
PUT /granules/{granuleID}
```

#### Example request

```curl
$ curl --request PUT https://example.com/granules/1A0000-2016121001_002_001 --header 'Authorization: Basic Base64EncodedCredentials' --data '{"action": "removeFromCmr"}'
```

#### Example response

```json
{
  "pdrName": "good_25grans.PDR",
  "createdAt": 1491926376632,
  "granuleId": "1A0000-2016121001_002_001",
  "provider": "LPDAAC_HTTP_MODIS",
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
  "files": {
    "origin-hdf5": {
      "regex": "^(pg-PR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
      "access": "private",
      "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-PR1A0000-2016121001_002_001",
      "size": 116495663,
      "sampleFileName": "pg-PR1A0000-2016121001_000_001",
      "name": "pg-PR1A0000-2016121001_002_001",
      "source": "sips",
      "stagingFile": "s3://cumulus-internal/staging/pg-PR1A0000-2016121001_002_001",
      "archivedFile": "s3://cumulus-private/pg-PR1A0000-2016121001_002_001"
    },
    "processed-hdf5": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\.hdf$",
      "access": "protected",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829.hdf",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.hdf",
      "name": "AST_L1A_00312092016105058_04112017185932.hdf",
      "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.hdf"
    },
    "origin-thumbnail": {
      "regex": "^(pg-BR1A[0-9]{4}-[0-9]{10}_[0-9]{3}_[0-9]{3})$",
      "access": "private",
      "sipFile": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/DATA/ID1612101200/pg-BR1A0000-2016121001_002_001",
      "size": 165916,
      "sampleFileName": "pg-BR1A0000-2016121001_000_001",
      "name": "pg-BR1A0000-2016121001_002_001",
      "source": "sips",
      "stagingFile": "s3://cumulus-internal/staging/pg-BR1A0000-2016121001_002_001",
      "archivedFile": "s3://cumulus-private/pg-BR1A0000-2016121001_002_001"
    },
    "meta-xml": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\.meta\\.xml$",
      "access": "protected",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829.meta.xml",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932.xml",
      "name": "AST_L1A_00312092016105058_04112017185932.xml",
      "archivedFile": "s3://cumulus-protected/AST_L1A_00312092016105058_04112017185932.xml"
    },
    "thumbnail-2": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_2.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_2.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_SWIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_SWIR.jpg"
    },
    "thumbnail-1": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_1.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_1.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_VNIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_VNIR.jpg"
    },
    "thumbnail-3": {
      "regex": "^AST_L1A_[\\d]*_[\\d]*\\_3.jpg$",
      "access": "public",
      "sampleFileName": "AST_L1A_00301052017002700_02242017094829_3.jpg",
      "source": "cumulus",
      "stagingFile": "s3://cumulus-internal/staging/AST_L1A_00312092016105058_04112017185932_TIR.jpg",
      "name": "AST_L1A_00312092016105058_04112017185932_TIR.jpg",
      "archivedFile": "s3://cumulus-public/AST_L1A_00312092016105058_04112017185932_TIR.jpg"
    }
  },
  "ingestStartedAt": 1491926376632,
  "published": true,
  "collectionName": "AST_L1A__version__003",
  "status": "failed",
  "updatedAt": 1491949303621,
  "timestamp": "2017-04-11T22:21:43.273Z",
  "ingestEndedAt": 1491926743852,
  "ingestDuration": 0,
  "timeline": {
    "cmr": {
      "startedAt": 1491937190010,
      "endedAt": 1491926764500
    },
    "archive": {
      "startedAt": 1491937173781,
      "endedAt": 1491937190010
    },
    "processStep": {
      "startedAt": 1491937126577,
      "endedAt": 1491937173781
    }
  },
  "processingStartedAt": 1491937124060,
  "processStepDuration": 47.204,
  "archiveDuration": 16.229,
  "processingEndedAt": 1491926764500,
  "duration": 10.159,
  "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1219413874-LPCUMULUS",
  "totalDuration": 19.809,
  "cmrDuration": 1.364,
  "processingDuration": 10.159,
  "errorType": "processing",
  "error": "\"The granule did not complete or fail for at least 200 minutes\""
}
```

## Delete granule

Delete a granule from Cumulus. It must _already_ be removed from CMR.

```endpoint
DELETE /granules/{granuleID}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/granules/1A0000-2016121001_002_001 --header 'Authorization: Basic Base64EncodedCredentials'

```

#### Example response

```json
{
  "detail": "Record deleted"
}
```
