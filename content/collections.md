## List collections

List collections in the Cumulus system.

If the query includes a value of `true` for `getMMT`, cumulus will search the CMR for each collection and insert the link to the Metadata Management Tool (MMT) into each result under `MMTLink`

If the query includes a value of `true` for `includeStats`, cumulus will compute and include the granule aggregation statistics in each collection's return value.

```endpoint
GET /collections
```

#### Example request

```curl
$ curl https://example.com/collections --header 'Authorization: Bearer ReplaceWithTheToken'
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
        }
    ]
}
```

## List collections with active granules

List collections in the Cumulus system that have active associated granules.

If time parameters are specified, the query will return collections that have granules that have been updated in that time frame.

If the query includes a value of `true` for `getMMT`, cumulus will search the CMR for each collection and insert the link to the Metadata Management Tool (MMT) into each result under `MMTLink`

If the query includes a value of `true` for `includeStats`, cumulus will compute and include the granule aggregation statistics in each collection's return value.

```endpoint
GET /collections/active
```

#### Example request

```curl
$ curl https://example.com/collections/active?includeStats=true --header 'Authorization: Bearer ReplaceWithTheToken'
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
}
```

## Create collection

Create a collection. For more information on creating collections and the contents of a request see [the Cumulus setup documentation](https://nasa.github.io/cumulus/docs/data-cookbooks/setup#collections). A collection generally includes, but is not limited to, the fields listed below.

Overview of the schema fields:

| Field | Value | Description |
| --- | --- | --- |
| `name` | `string` | collection name |
| `version` | `string` | collection version |
| `dataType` | `string` | matches collection with PDR datatype |
| `duplicateHandling` | `"replace"`&vert;`"version"`&vert;`"skip"`&vert;`"error"` | duplicate handling protocol |
| `process` | `string` | process choice step variable |
| `provider_path` | `string` | path of remote files to sync |
| `granuleId` | `string (regex)` | regex to match granule IDs |
| `granuleIdExtraction` | `string (regex)` | regex to extract ID from files |
| `sampleFileName` | `string` | sample filename for granule ID |
| `url_path` | `string` | s3 prefix template |
| `files` | `array` | array of file specification objects |
| `-- file.bucket` | `string` | file destination bucket |
| `-- file.regex` | `string (regex)` | regex to match file names |
| `-- file.sampleFileName` | `string` | sample filename |
| `-- file.url_path` | `string` | s3 prefix template |
| `-- file.fileType` | `string` | granule file fileType mapping |

```endpoint
POST /collections
```

#### Example request

```curl
$ curl --request POST https://example.com/collections --header 'Authorization: Bearer ReplaceWithToken' --header 'Content-Type: application/json' --data '{
  "name": "MOD09GQ",
  "version": "006",
  "dataType": "MOD09GQ",
  "process": "modis",
  "duplicateHandling": "replace",
  "provider_path": "cumulus-test-data/pdrs",
  "granuleId": "^MOD09GQ\\.A[\\d]{7}\\.[\\S]{6}\\.006\\.[\\d]{13}$",
  "granuleIdExtraction": "(MOD09GQ\\..*)(\\.hdf|\\.cmr|_ndvi\\.jpg)",
  "url_path": "{cmrMetadata.Granule.Collection.ShortName}___{cmrMetadata.Granule.Collection.VersionId}/{substring(file.name, 0, 3)}",
  "sampleFileName": "MOD09GQ.A2017025.h21v00.006.2017034065104.hdf",
  "files": [
    {
      "bucket": "protected",
      "regex": "^MOD09GQ\\.A[\\d]{7}\\.[\\S]{6}\\.006\\.[\\d]{13}\\.hdf$",
      "sampleFileName": "MOD09GQ.A2017025.h21v00.006.2017034065104.hdf",
      "url_path": "{cmrMetadata.Granule.Collection.ShortName}___{cmrMetadata.Granule.Collection.VersionId}/{extractYear(cmrMetadata.Granule.Temporal.RangeDateTime.BeginningDateTime)}/{substring(file.name, 0, 3)}"
    }
  ]
}'
```

#### Example response

```json
{
    "message": "Record saved",
    "record": {
        "name": "MOD09GQ",
        "version": "006",
        "dataType": "MOD09GQ",
        "duplicateHandling": "replace",
        "process": "modis",
        "provider_path": "cumulus-test-data/pdrs",
        "granuleId": "^MOD09GQ\\.A[\\d]{7}\\.[\\S]{6}\\.006\\.[\\d]{13}$",
        "granuleIdExtraction": "(MOD09GQ\\..*)(\\.hdf|\\.cmr|_ndvi\\.jpg)",
        "url_path": "{cmrMetadata.Granule.Collection.ShortName}___{cmrMetadata.Granule.Collection.VersionId}/{substring(file.name, 0, 3)}",
        "sampleFileName": "MOD09GQ.A2017025.h21v00.006.2017034065104.hdf",
        "files": [
            {
                "bucket": "protected",
                "regex": "^MOD09GQ\\.A[\\d]{7}\\.[\\S]{6}\\.006\\.[\\d]{13}\\.hdf$",
                "sampleFileName": "MOD09GQ.A2017025.h21v00.006.2017034065104.hdf",
                "url_path": "{cmrMetadata.Granule.Collection.ShortName}___{cmrMetadata.Granule.Collection.VersionId}/{extractYear(cmrMetadata.Granule.Temporal.RangeDateTime.BeginningDateTime)}/{substring(file.name, 0, 3)}"
            }
        ],
        "createdAt": 1491946535919
    }
}
```

## Update/replace collection

Update/replace an existing collection. Expects payload to specify the entire
collection object, and will completely replace the existing collection with the
specified payload. For a field reference see
["Create collection"](#create-collection).

Returns status 200 on successful replacement, 400 if the `name` or `version`
property in the payload does not match the corresponding value in the resource
URI, or 404 if there is no collection with the specified name and version.

```endpoint
PUT /collections/{name}/{version}
```

#### Example request

```curl
$ curl --request PUT https://example.com/collections/MOD09GQ/006 --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{
  "name": "MOD09GQ",
  "version": "006",
  "dataType": "MOD09GQ",
  "duplicateHandling": "error",
  "newNeededField": "myCustomFieldValue",
  "process": "modis",
  "provider_path": "new_path/test-data",
  "granuleId": "^MOD09GQ\\.A[\\d]{7}\\.[\\S]{6}\\.006\\.[\\d]{13}$",
  "granuleIdExtraction": "(MOD09GQ\\..*)(\\.hdf|\\.cmr|_ndvi\\.jpg)",
  "url_path": "{cmrMetadata.Granule.Collection.ShortName}___{cmrMetadata.Granule.Collection.VersionId}/{substring(file.name, 0, 3)}",
  "sampleFileName": "MOD09GQ.A2017025.h21v00.006.2017034065104.hdf",
  "files": [
    {
      "bucket": "protected",
      "regex": "^MOD09GQ\\.A[\\d]{7}\\.[\\S]{6}\\.006\\.[\\d]{13}\\.hdf$",
      "sampleFileName": "MOD09GQ.A2017025.h21v00.006.2017034065104.hdf",
      "url_path": "{cmrMetadata.Granule.Collection.ShortName}___{cmrMetadata.Granule.Collection.VersionId}/{extractYear(cmrMetadata.Granule.Temporal.RangeDateTime.BeginningDateTime)}/{substring(file.name, 0, 3)}"
    }
  ]
}'
```

#### Example successful response

```json
{
  "name": "MOD09GQ",
  "version": "006",
  "dataType": "MOD09GQ",
  "duplicateHandling": "error",
  "newNeededField": "myCustomFieldValue",
  "process": "modis",
  "provider_path": "new_path/test-data",
  "granuleId": "^MOD09GQ\\.A[\\d]{7}\\.[\\S]{6}\\.006\\.[\\d]{13}$",
  "granuleIdExtraction": "(MOD09GQ\\..*)(\\.hdf|\\.cmr|_ndvi\\.jpg)",
  "url_path": "{cmrMetadata.Granule.Collection.ShortName}___{cmrMetadata.Granule.Collection.VersionId}/{substring(file.name, 0, 3)}",
  "sampleFileName": "MOD09GQ.A2017025.h21v00.006.2017034065104.hdf",
  "files": [
    {
      "bucket": "protected",
      "regex": "^MOD09GQ\\.A[\\d]{7}\\.[\\S]{6}\\.006\\.[\\d]{13}\\.hdf$",
      "sampleFileName": "MOD09GQ.A2017025.h21v00.006.2017034065104.hdf",
      "url_path": "{cmrMetadata.Granule.Collection.ShortName}___{cmrMetadata.Granule.Collection.VersionId}/{extractYear(cmrMetadata.Granule.Temporal.RangeDateTime.BeginningDateTime)}/{substring(file.name, 0, 3)}"
    }
  ],
  "createdAt": 1491946535919,
  "updatedAt": 1514304825894
}
```

## Delete collection

Delete a collection from Cumulus, but not from CMR. All related granules in Cumulus must have already been deleted from Cumulus.

```endpoint
DELETE /collections/{name}/{version}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/collections/MOD09GQ/006 --header 'Authorization: Bearer ReplaceWithTheToken'

```

#### Example response

```json
{
  "message": "Record deleted"
}
```
