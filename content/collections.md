## List collections

List collections in the Cumulus system.

```endpoint
GET /collections
```

#### Example request

```curl
$ curl https://example.com/collections --header 'Authorization: Bearer AccessToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "collection",
        "limit": 1,
        "page": 1,
        "count": 3
    },
    "results": [
        {
            "name": "MOD11A1",
            "version": "006",
            "dataType": "MOD11A1",
            "process": "modis",
            "provider_path": "/",
            "granuleId": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}$",
            "granuleIdExtraction": "(MOD11A1\\..*)\\.hdf",
            "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104.hdf",
            "files": [
                {
                    "bucket": "protected",
                    "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}\\.hdf$",
                    "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104.hdf"
                },
                {
                    "bucket": "private",
                    "regex": "^BROWSE\\.MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}\\.hdf$",
                    "sampleFileName": "BROWSE.MOD11A1.A2017025.h21v00.006.2017034065104.hdf"
                },
                {
                    "bucket": "private",
                    "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}\\.hdf\\.met$",
                    "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104.hdf.met"
                },
                {
                    "bucket": "protected",
                    "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}\\.cmr\\.xml$",
                    "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104.cmr.xml"
                },
                {
                    "bucket": "public",
                    "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}_2\\.jpg$",
                    "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104_2.jpg"
                },
                {
                    "bucket": "public",
                    "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}_1\\.jpg$",
                    "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104_1.jpg"
                }
            ],
            "timestamp": 1513020427284,
            "createdAt": 1510761441174,
            "updatedAt": 1513020427162,
            "edpa": true,
            "some_other_field": "field",
            "duplicateHandling": "skip",
            "stats": {
                "running": 0,
                "completed": 6,
                "failed": 1,
                "total": 7
            }
        }
    ]
}
```

## Retrieve collection

Retrieve a single collection.

```endpoint
GET /collections/{name}/{version}
```

#### Example request

```curl
$ curl https://example.com/collections/MOD11A1/006 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "process": "modis",
    "granuleIdExtraction": "(MOD11A1\\..*)\\.hdf",
    "version": "006",
    "dataType": "MOD11A1",
    "some_other_field": "field",
    "createdAt": 1510761441174,
    "edpa": true,
    "name": "MOD11A1",
    "duplicateHandling": "skip",
    "provider_path": "/",
    "files": [
        {
            "bucket": "protected",
            "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104.hdf",
            "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}\\.hdf$"
        },
        {
            "bucket": "private",
            "sampleFileName": "BROWSE.MOD11A1.A2017025.h21v00.006.2017034065104.hdf",
            "regex": "^BROWSE\\.MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}\\.hdf$"
        },
        {
            "bucket": "private",
            "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104.hdf.met",
            "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}\\.hdf\\.met$"
        },
        {
            "bucket": "protected",
            "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104.cmr.xml",
            "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}\\.cmr\\.xml$"
        },
        {
            "bucket": "public",
            "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104_2.jpg",
            "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}_2\\.jpg$"
        },
        {
            "bucket": "public",
            "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104_1.jpg",
            "regex": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}_1\\.jpg$"
        }
    ],
    "updatedAt": 1513020427162,
    "granuleId": "^MOD11A1\\.A[\\d]{7}\\.[\\S]{6}\\.006.[\\d]{13}$",
    "sampleFileName": "MOD11A1.A2017025.h21v00.006.2017034065104.hdf",
    "stats": {
        "running": 0,
        "completed": 6,
        "failed": 1,
        "total": 7
    }
}
```

## Create collection

Create a collection.

```endpoint
POST /collections
```

#### Example request

```curl
$ curl --request POST https://example.com/collections --header 'Authorization: Bearer ReplaceWithToken' --data '{
    "changedBy": "Jane Smith",
    "cmrProvider": "MY_DAAC",
    "name": "MY_COLLECTION",
    "version": "1",
    "createdAt": 1491946535919,
    "granuleId": "^MY_COLLECTION\\.A[\\d]{7}\\.[\\S]{6}\\.1.[\\d]{13}$",
    "granuleIdExtraction": "(MY_COLLECTION\\..*)\\.hdf",
    "sampleFileName": "MY_COLLECTION.A2017025.h21v00.1.2017034065104.hdf",
     "files": [
        {
            "bucket": "protected",
            "sampleFileName": "MY_COLLECTION.A2017025.h21v00.1.2017034065104.hdf",
            "regex": "^MY_COLLECTION\\.A[\\d]{7}\\.[\\S]{6}\\.1.[\\d]{13}\\.hdf$"
        }],
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
    "message": "Record saved",
    "record": {
        "changedBy": "Jane Smith",
        "cmrProvider": "MY_DAAC",
        "name": "MY_COLLECTION",
        "version": "1",
        "createdAt": 1491946535919,
        "granuleId": "^MY_COLLECTION\\.A[\\d]{7}\\.[\\S]{6}\\.1.[\\d]{13}$",
        "granuleIdExtraction": "(MY_COLLECTION\\..*)\\.hdf",
        "sampleFileName": "MY_COLLECTION.A2017025.h21v00.1.2017034065104.hdf",
        "files": [
            {
                "bucket": "protected",
                "sampleFileName": "MY_COLLECTION.A2017025.h21v00.1.2017034065104.hdf",
                "regex": "^MY_COLLECTION\\.A[\\d]{7}\\.[\\S]{6}\\.1.[\\d]{13}\\.hdf$"
            }
        ],
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
        "updatedAt": 1513960696308,
        "provider_path": "/",
        "duplicateHandling": "replace",
        "timestamp": 1513960696736
    }
}
```

## Update collection

Update values for a collection. Can accept the whole collection object, or just a subset of fields, the ones that are being updated.

```endpoint
PUT /collections/{name}/{version}
```

#### Example request

```curl
$ curl --request PUT https://example.com/collections/MY_COLLECTION/1 --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
	"name": "MY_COLLECTION",
	"version": "1",
    "providers": ["ANOTHER_PROVIDER"]
}'
```

#### Example response

```json
{
    "granuleIdExtraction": "(MY_COLLECTION\\..*)\\.hdf",
    "version": "1",
    "recipe": {
        "processStep": {
            "config": {
                "inputFiles": [
                    "foobar"
                ],
                "image": "asterProcessing",
                "outputFiles": [
                    "foobar"
                ]
            }
        },
        "order": [
            "archive"
        ]
    },
    "cmrProvider": "MY_DAAC",
    "providers": [
        "ANOTHER_PROVIDER"
    ],
    "createdAt": 1491946535919,
    "changedBy": "Jane Smith",
    "name": "MY_COLLECTION",
    "duplicateHandling": "replace",
    "provider_path": "/",
    "files": [
        {
            "bucket": "protected",
            "sampleFileName": "MY_COLLECTION.A2017025.h21v00.1.2017034065104.hdf",
            "regex": "^MY_COLLECTION\\.A[\\d]{7}\\.[\\S]{6}\\.1.[\\d]{13}\\.hdf$"
        }
    ],
    "updatedAt": 1514304825894,
    "granuleId": "^MY_COLLECTION\\.A[\\d]{7}\\.[\\S]{6}\\.1.[\\d]{13}$",
    "sampleFileName": "MY_COLLECTION.A2017025.h21v00.1.2017034065104.hdf",
    "timestamp": 1514304826284
}
```

## Delete collection

Delete a collection from Cumulus, but not from CMR. All related granules in Cumulus must have already been deleted from Cumulus.

```endpoint
DELETE /collections/{name}/{version}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/collections/MY_COLLECTION/1 --header 'Authorization: Bearer ReplaceWithTheToken'

```

#### Example response

```json
{
  "message": "Record deleted"
}
```
