## List granules

List granules in the Cumulus system.

If the query includes a value of `true` for `getRecoveryStatus`, `recoveryStatus` will be included in each granule's return value when applicable.

If the query string parameters include a value of `true` for `includeFullRecord`, any associated files and executions will be included in each granule's return value.

```endpoint
GET /granules
```

#### Example request

```curl
$ curl https://example.com/granules --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "granule",
        "limit": 1,
        "page": 1,
        "count": 8,
        "searchContext": "%5B%221577836800000%22%5D",
    },
    "results": [
        {
            "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
            "pdrName": "7970bff5-128a-489f-b43c-de4ad7834ce5.PDR",
            "collectionId": "MOD11A1___006",
            "status": "completed",
            "provider": "LP_TS2_DataPool",
            "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:7f071dae1a93c9892272b7fd5",
            "files": [
                {
                    "bucket": "cumulus-devseed-protected",
                    "checksum": 964704694,
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "fileSize": 1447347,
                    "fileType": "data",
                    "checksumType": "CKSUM",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
                },
                {
                    "bucket": "cumulus-devseed-private",
                    "checksum": 121318124,
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
                    "fileSize": 22559,
                    "fileType": "metadata",
                    "checksumType": "CKSUM",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met"
                },
                {
                    "bucket": "cumulus-devseed-private",
                    "checksum": 2188150664,
                    "key": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "fileSize": 18118,
                    "fileType": "data",
                    "checksumType": "CKSUM",
                    "fileName": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
                },
                {
                    "bucket": "cumulus-devseed-public",
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg",
                    "fileType": "browse",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg"
                },
                {
                    "bucket": "cumulus-devseed-protected",
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml",
                    "fileType": "metadata",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml"
                },
                {
                    "bucket": "cumulus-devseed-public",
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg",
                    "fileType": "browse",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg"
                }
            ],
            "error": null,
            "createdAt": 1513020455831,
            "timestamp": 1513020462156,
            "published": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS",
            "duration": 6.325,
            "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS"
        }
    ]
}
```

## List granules with searchContext

List granules in the Cumulus system with searchContext from a previous query.
Must include all of previous query's `sort`, `order`, or `sort_key` query string parameters.
Must not include `from` and `to` query string parameters.

```endpoint
GET /granules
```

#### Example request

```curl
$ curl https://example.com/granules?searchContext=%5B%221577836800000%22%5D --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "granule",
        "limit": 1,
        "page": 1,
        "count": 8,
        "searchContext": "%5B%221606780899999%22%5D",
    },
    "results": [
        {
            "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
            "pdrName": "7970bff5-128a-489f-b43c-de4ad7834ce5.PDR",
            "collectionId": "MOD11A1___006",
            "status": "completed",
            "provider": "LP_TS2_DataPool",
            "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:7f071dae1a93c9892272b7fd5",
            "files": [
                {
                    "bucket": "cumulus-devseed-protected",
                    "checksum": 964704694,
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "fileSize": 1447347,
                    "fileType": "data",
                    "checksumType": "CKSUM",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
                },
                {
                    "bucket": "cumulus-devseed-private",
                    "checksum": 121318124,
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
                    "fileSize": 22559,
                    "fileType": "metadata",
                    "checksumType": "CKSUM",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met"
                },
                {
                    "bucket": "cumulus-devseed-private",
                    "checksum": 2188150664,
                    "key": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "fileSize": 18118,
                    "fileType": "data",
                    "checksumType": "CKSUM",
                    "fileName": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
                },
                {
                    "bucket": "cumulus-devseed-public",
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg",
                    "fileType": "browse",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg"
                },
                {
                    "bucket": "cumulus-devseed-protected",
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml",
                    "fileType": "metadata",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml"
                },
                {
                    "bucket": "cumulus-devseed-public",
                    "key": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg",
                    "fileType": "browse",
                    "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg"
                }
            ],
            "error": null,
            "createdAt": 1513020455831,
            "timestamp": 1513020462156,
            "published": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS",
            "duration": 6.325,
            "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS"
        }
    ]
}
```

## Retrieve granule

Retrieve a single granule. Two routes are currently available. The preferred query includes both a Collection ID and a Granule ID to identify a unique granule.

**Please note** -- Querying by the Granule ID alone (e.g. `GET /granules/{granuleId}`) is supported but may be deprecated in the future.

If the query includes a value of `true` for `getRecoveryStatus`, the returned granule will include `recoveryStatus` when applicable.

If the query string parameters include a value of `true` for `includeFullRecord`, any associated files and executions will be included in the granule's return value.

```endpoint
GET /granules/{collectionId}/{granuleId}
```

#### Example request

```curl
$ curl https://example.com/granules/MOD11A1.A2017137.h20v17.006.2017138085755 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
    "pdrName": "7970bff5-128a-489f-b43c-de4ad7834ce5.PDR",
    "collectionId": "MOD11A1___006",
    "status": "completed",
    "provider": "LP_TS2_DataPool",
    "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:7f071dae1a93c9892272b7fd5",
    "files": [
        {
            "bucket": "cumulus-devseed-protected",
            "checksum": 964704694,
            "key": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "fileSize": 1447347,
            "checksumType": "CKSUM",
            "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
        },
        {
            "bucket": "cumulus-devseed-private",
            "checksum": 121318124,
            "key": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
            "fileSize": 22559,
            "checksumType": "CKSUM",
            "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met"
        },
        {
            "bucket": "cumulus-devseed-private",
            "checksum": 2188150664,
            "key": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "fileSize": 18118,
            "checksumType": "CKSUM",
            "fileName": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
        },
        {
            "bucket": "cumulus-devseed-protected",
            "key": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
        },
        {
            "bucket": "cumulus-devseed-public",
            "key": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg",
            "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg"
        },
        {
            "bucket": "cumulus-devseed-protected",
            "key": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml",
            "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml"
        },
        {
            "bucket": "cumulus-devseed-public",
            "key": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg",
            "fileName": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg"
        }
    ],
    "error": null,
    "createdAt": 1513020455831,
    "timestamp": 1513020462156,
    "published": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS",
    "duration": 6.325,
    "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS",
    "_id": "MOD11A1.A2017137.h20v17.006.2017138085755"
}
```

## Create Granule

Create a granule. A `granule` can have the following fields.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `beginningDateTime` | `string`| `no` | The time when the granule's temporal coverage begins |
| `cmrLink` | `string`| `no` | link to CMR |
| `collectionId` | `string`| `yes` | Collection associated with the granule |
| `createdAt` | `integer`| `no` | Time granule record was created (now) |
| `duration` | `number`| `no` | Ingest duration milliseconds |
| `endingDateTime` | `string`| `no` | The time when the granule's temporal coverage ends |
| `error` | `object`| `no` | The error details for this granule |
| `execution` | `string`| `no` | Step Function Execution URL |
| `files` | `array`| `no` | Files associated with the granule |
| `granuleId` | `string`| `yes` | Granule ID |
| `lastUpdateDateTime` | `string`| `no` | The date/time that data provider last updated the granule info on data provider's database |
| `pdrName` | `string`| `no` | PDR associated with the granule |
| `processingEndDateTime` | `string`| `no` | Time processing of granule ends. Usually a StepFunction's stop time |
| `processingStartDateTime` | `string`| `no` | Time processing of granule began. Usually a StepFunction's start time |
| `productVolume` | `number`| `no` | Sum of the granule's file's sizes in bytes |
| `productionDateTime` | `string`| `no` | The date and time a specific granule was produced by a PGE |
| `provider` | `string`| `no` | Granule's provider |
| `published` | `boolean`| `no` | If granule is published to CMR |
| `queryFields` | `object`| `no` | Arbitrary query fields assigned to the granule |
| `status` | `string`| `yes` | Ingest status of the granule one of ['running', 'completed', 'failed'] |
| `timeToArchive` | `number`| `no` | Time to post to CMR in seconds |
| `timeToPreprocess` | `number`| `no` |  Time to sync granule in seconds |
| `timestamp` | `integer`| `no` | Timestamp for granule record (now) |
| `updatedAt` | `integer`| `no` | Update Time for granule (now) |

```endpoint
POST /granules
```
#### Example request
```curl
$ curl --request POST https://example.com/granules \
  --header 'Authorization: Bearer ReplaceWithToken' \
  --header 'Content-Type: application/json' \
  --data '{
    "granuleId": "granuleId.A20200113.006.1005",
  "collectionId": "alpha___006",
  "status": "running",
  "beginningDateTime": "1995-01-01T00:00:00.000Z",
  "cmrLink": "https://mmt.uat.earthdata.nasa.gov/collections/C1237256734-CUMULUS",
  "createdAt": 1631547286190,
  "duration": 60000,
  "endingDateTime": "2021-09-13T00:00:00.000Z",
  "error": {},
  "execution": "https://example.com/executions/arn:aws:states:us-east-1:123456789012:execution:TestStepFunction2:cff1266e-ef36-664f-ff00-3a4d26bd1735",
  "files": [
    {
      "bucket": "stack-protected",
      "key": "granuleId.A20200113.006.1005.hdf",
      "fileName": "granuleId.A20200113.006.1005.hdf"
    }
  ],
  "lastUpdateDateTime":"2021-09-12T15:10:01.000Z",
  "pdrName": "aPdrName",
  "processingEndDateTime": "2020-10-13T23:59:59.999Z",
  "processingStartDateTime": "2020-10-13T00:00:00.000Z",
  "productVolume": 59632353,
  "productionDateTime": "2020-10-14T15:40:05.546Z",
  "provider": "s3-local",
  "published": true,
  "queryFields": {"custom": "values can go here"},
  "timeToArchive": 5001,
  "timeToPreprocess": 3240,
  "timestamp":1631547675248,
  "updatedAt":1631547675248
  }'
```

#### Example response

```json
{
    "message": "Successfully wrote granule with Granule Id: granuleId.A20200113.006.1005"
}
```

## Replace granule

Replace an existing granule.  Expects payload to contain the modified
parts of the granule and the existing granule values will be overwritten by the
modified portions.   Any unspecified values will be removed, and appropriate
fields will be replaced with defaults.    Executions associated will not be modified if
not specified.  The same fields are available as are for [creating a granule.](#create-granule).

Returns status 200 on successful update, 201 on new granule creation, 404 if
the `granuleId` can not be found in the database, or 400 when the granuleId in
the payload does not match the corresponding value in the resource URI.

**Please note** -- In versions of CUMULUS prior to release v16, PUT endpoint was
identical to PATCH requests.

```endpoint
PUT /granules/{collectionId}/{granuleId}
```

### Example request

```curl
$ curl --request PUT https://example.com/granules/COLLECTION___VERSION/granuleId.A19990103.006.1000 \
  --header 'Authorization: Bearer ReplaceWithToken' \
  --header 'Content-Type: application/json' \
  --header 'Cumulus-API-Version: 2'\  --data '{
  "granuleId": "granuleId.A20200113.006.1005",
  "files": [
    {
      "bucket": "stack-protected",
      "key": "granuleId.A20200113.006.1005.hdf",
      "fileName": "granuleId.A20200113.006.1005.hdf"
    },
    {
      "bucket": "stack-protected",
      "key": "granuleId.A20200113.006.1005.jpg",
      "fileName": "granuleId.A20200113.006.1005.jpg"
    }
  ],
  "duration": 1000,
  "status": "completed"
  }'
```

#### Example response

```json
{
    "message": "Successfully updated granule with Granule Id: granuleId.A20200113.006.1005, CollectionId: COLLECTION___VERSION"
}
```

## Update granule

Update an existing granule. Expects payload to contain the modified
parts of the granule as the existing granule values will be overwritten by the
modified portions. Unspecified keys will be retained. Keys set to `null`
will be removed. Executions will not be disassociated from the granule via
`null` deletion. The same fields are available as are for [creating a
granule.](#create-granule).

Returns status 200 on successful update, 201 on new granule creation, 404 if
the `granuleId` can not be found in the database, or 400 when the granuleId in
the payload does not match the corresponding value in the resource URI.

**Please note** -- Querying by the Granule ID alone (e.g. `PATCH /granules/{granuleId}`) is supported but may be deprecated in the future.


```endpoint
PATCH /granules/{collectionId}/{granuleId}
```

#### Example request

```curl
$ curl --request PATCH https://example.com/granules/granuleId.A19990103.006.1000 \
  --header 'Authorization: Bearer ReplaceWithToken' \
  --header 'Content-Type: application/json' \
  --header 'Cumulus-API-Version: 2' \
  --data '{
  "granuleId": "granuleId.A20200113.006.1005",
  "files": [
    {
      "bucket": "stack-protected",
      "key": "granuleId.A20200113.006.1005.hdf",
      "fileName": "granuleId.A20200113.006.1005.hdf"
    },
    {
      "bucket": "stack-protected",
      "key": "granuleId.A20200113.006.1005.jpg",
      "fileName": "granuleId.A20200113.006.1005.jpg"
    }
  ],
  "duration": 1000,
  "status": "completed"
  }'
```

#### Example response

```json
{
    "message": "Successfully updated granule with Granule Id: granuleId.A20200113.006.1005"
}
```

## Associate execution

Associate an execution with a granule. Returns status 200 on successful
association, 404 if the granule or execution can not be found in the database,
or 400 when the granuleId in the payload does not match the corresponding
value in the resource URI.

The request should have the following fields.

| Field | Type | Description |
| --- | --- | --- |
| `collectionId` | `string` | Collection associated with the granule (e.g. `<name>___<version>` where `<name>` is the collection name and `<version>` is the collection version) |
| `granuleId` | `string` | Granule ID |
| `executionArn` | `string` | Execution arn |

```endpoint
POST /granules/{granuleId}/executions
```

#### Example request

```curl
$ curl --request POST https://example.com/granules/granuleId.A19990103.006.1000/executions \
  --header 'Authorization: Bearer ReplaceWithToken' \
  --header 'Content-Type: application/json' \
  --header 'Cumulus-API-Version: 2'\
  --data '{
  "granuleId": "granuleId.A19990103.006.1000",
  "collectionId": "MOD09GQ___006",
  "executionArn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735"
  }'
```

#### Example response

```json
{
    "message": "Successfully associated execution arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735 with granule granuleId granuleId.A19990103.006.1000 collectionId MOD09GQ___006"
}
```

## Reingest granule

Reingest a granule. This causes the granule to re-download to Cumulus from
source, and begin processing from scratch.  Reingesting a granule will
overwrite existing granule files.

You trigger the reingest by posting with the data's `action` set to `reingest`.

A reingest request may also include one optional parameters, either
`executionArn` or `workflowName`.  Use of one of these will cause the reingest
occur, but before running the ingest, a different original payload is found
from existing executions and used in place of the most recent execution.  This
has the result of allowing you to reingest a granule with any of it's previous
inputs.  If `executionArn` is specified, the originalMessage is pulled directly
from that execution.  When `workflowName` is specified, the database is search
to find all of the executions with that workflowName that were run on the
granuleid, and the most recent originalMessage is pulled and used for the
reingest.  Remember only to supply either `executionArn` or `workflowName`, if
both are present, workflowName is ignored and executionArn is used to determining
the input message to the reingest.


```endpoint
PATCH /granules/{granuleId}
```

#### Example request

```curl
$ curl --request PATCH https://example.com/granules/MOD11A1.A2017137.h20v17.006.2017138085755
       --header 'Authorization: Bearer ReplaceWithTheToken'
       --header 'Content-Type: application/json'
       --header 'Cumulus-API-Version: 2'\
       --data '{"action": "reingest",
               ["executionArn": "arn:aws:states:us-east-1:123456789012:execution:stack-lambdaName:9da47a3b-4d85-4599-ae78-dbec2e042520"],
               ["workflowName": "TheWorkflowName"] }'
```

#### Example response

A warning message is included in the response if the collection's
duplicateHandling is not set to 'replace'.

```json
{
    "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
    "action": "reingest",
    "status": "SUCCESS",
    "warning": "The granule files may be overwritten"
}
```

## Apply workflow to granule

Apply the named workflow to the granule. Workflow input will be built from template and provided entire Cumulus granule record as payload.

```endpoint
PATCH /granules/{granuleid}
```

#### Example request

```curl
$ curl --request PATCH https://example.com/granules/MOD11A1.A2017137.h19v16.006.2017138085750 --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json'   --header 'Cumulus-API-Version: 2'\ --data '{ "action": "applyWorkflow", "workflow": "inPlaceWorkflow" }'
```

#### Example response

```json
{
    "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
    "action": "applyWorkflow inPlaceWorkflow",
    "status": "SUCCESS"
}
```

## Move a granule

Move a granule from one location on S3 to another. Individual files are moved to specific locations by using a regex that matches their filenames.

```endpoint
PATCH /granules/{granuleId}
```

#### Example request

```curl
$ curl --request PATCH https://example.com/granules/MOD11A1.A2017137.h19v16.006.2017138085750 --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json'   --header 'Cumulus-API-Version: 2'\
 --data '{ "action": "move", "destinations": [{ "regex": ".*.hdf$", "bucket": "s3-bucket", "filepath": "new/filepath/" }]}'
```

#### Example response

```json
{
  "granuleId": "MOD11A1.A2017137.h19v16.006.2017138085750",
  "action": "move",
  "status": "SUCCESS"
}
```

## Remove granule from CMR

Remove a Cumulus granule from CMR.

```endpoint
PATCH /granules/{granuleId}
```

#### Example request

```curl
$ curl --request PATCH https://example.com/granules/MOD11A1.A2017137.h19v16.006.2017138085750   --header 'Cumulus-API-Version: 2'\
 --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --header 'Cumulus-API-Version: 2'\ --data '{"action": "removeFromCmr"}'
```

#### Example response

```json
{
    "granuleId": "MOD11A1.A2017137.h19v16.006.2017138085750",
    "action": "removeFromCmr",
    "status": "SUCCESS"
}
```

## Delete granule

Delete a granule from Cumulus. It must _already_ be removed from CMR.

**Please note** -- Querying by the Granule ID alone (e.g. `DELETE /granules/{granuleId}`) is supported but may be deprecated in the future.

```endpoint
DELETE /granules/{collectionId}/{granuleId}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/granules/1A0000-2016121001_002_001 --header 'Authorization: Bearer ReplaceWithTheToken'

```

#### Example response

```json
{
  "detail": "Record deleted"
}
```

## Bulk Operations

Apply a workflow to the granules provided. Granules can be sent as a list of IDs or as an Elasticsearch query to the Metrics' Elasticsearch.

Overview of the request fields:

| Field | Required | Value | Description |
| --- | --- | --- | --- |
| `workflow` | `Y` | `string` | Workflow to be applied to all granules |
| `granules` | `yes` - if `query` not present | `Array<object>` | List of Granules to process e.g. { granuleId, collectionId }. Required if there is no Elasticsearch query provided |
| `query` | `yes` - if `granules` not present | `Object` | Query to Elasticsearch to determine which Granules to go through given workflow. Required if no Granules are given. |
| `index` | `yes` - if `query` is present | `string` | Elasticsearch index to search with the given query |
| `knexDebug` |  `N` | `bool` | Sets knex PostgreSQL connection pool/query debug output.  Defaults to false |
| `queueUrl` | `N` | `string` | URL of SQS queue to use for scheduling granule workflows (e.g. `https://sqs.us-east-1.amazonaws.com/12345/queue-name`) |


```endpoint
POST /granules/bulk
```

#### Example request with Elasticsearch query generated by Kibana:

```curl
$ curl --request POST \
    https://example.com/granules/bulk --header 'Authorization: Bearer ReplaceWithTheToken' \
  --header 'Content-Type: application/json' \
  --data '{
        "workflowName": "HelloWorldWorkflow",
        "index": "index-in-es",
        "query": {
            "size": 500,
            "query": {
                "filter": [
                    {
                        "bool": {
                            "filter": [
                                {
                                    "bool": {
                                        "should": [{"match": {"granuleId": "MOD09GQ.A2016358.h13v04.006.2016360104606"}}],
                                        "minimum_should_match": 1
                                    }
                                },
                                {
                                    "bool": {
                                        "should": [{"match": {"status": "FAILED"}}],
                                        "minimum_should_match": 1
                                    }
                                }
                            ]
                        }
                    }
                ],
                "should": [],
                "must_not": []
            }
        }
    }'
```

#### Example request with given Granules:

```curl
curl -X POST
  https://example.com/granules/bulk --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{"granules": [ { "granuleId": "MOD09GQ.A2016358.h13v04.006.2016360104606", "collectionId": "MOD11A1___006" } ], "workflowName": "HelloWorldWorkflow"}'
```

#### Example response

```json
{
    "id": "0eb8e809-8790-5409-1239-bcd9e8d28b8e"
}
```

Use the [Retrieve async operation](#retrieve-async-operation) endpoint with the `id` in the response to determine the status of the async operation.

## Bulk Delete

Bulk delete the provided granules. Granules can be sent as a list of IDs or as an Elasticsearch query to the Metrics' Elasticsearch.

Overview of the request fields:

| Field | Required | Value | Description |
| --- | --- | --- | --- |
| `granules` | `yes` - if `query` not present | `Array<object>` | List of Granules to process e.g. { granuleId, collectionId }. Required if there is no Elasticsearch query provided |
| `index` | `yes` - if `query` is present | `string` | Elasticsearch index to search with the given query |
| `query` | `yes` - if `granules` not present | `Object` | Query to Elasticsearch to determine which Granules to delete. Required if no Granules are given |
| `concurrency` | `N` | `integer` | Sets the granule concurrency for the bulk deletion operation.  Defaults to `10` |
| `forceRemoveFromCmr` | `N` | `bool` | Whether to remove published granules from CMR before deletion. **You must set this value to `true` to do bulk deletion of published granules, otherwise deleting them will fail.**
| `knexDebug` |  `N` | `bool` | Sets knex PostgreSQL connection pool/query debug output.  Defaults to false |
| `maxDbConnections` | `N` | `integer` | Sets the maximum database connections to allocate for the operation.  Defaults to `concurrency` value |

```endpoint
POST /granules/bulkDelete
```

#### Example request with Elasticsearch query generated by Kibana:

```curl
$ curl --request POST \
    https://example.com/granules/bulkDelete --header 'Authorization: Bearer ReplaceWithTheToken' \
  --header 'Content-Type: application/json' \
  --data '{
        "forceRemoveFromCmr": true,
        "index": "index-in-es",
        "query": {
            "size": 500,
            "query": {
                "filter": [
                    {
                        "bool": {
                            "filter": [
                                {
                                    "bool": {
                                        "should": [{"match": {"granuleId": "MOD09GQ.A2016358.h13v04.006.2016360104606"}}],
                                        "minimum_should_match": 1
                                    }
                                },
                                {
                                    "bool": {
                                        "should": [{"match": {"status": "FAILED"}}],
                                        "minimum_should_match": 1
                                    }
                                }
                            ]
                        }
                    }
                ],
                "should": [],
                "must_not": []
            }
        }
    }'
```

#### Example request with given Granules:

```curl
curl -X POST
  https://example.com/granules/bulkDelete --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"granules": [ { "granuleId": "MOD09GQ.A2016358.h13v04.006.2016360104606", "collectionId": "MOD11A1___006" } ], "forceRemoveFromCmr": true}'
```

#### Example response

```json
{
    "id": "0eb8e809-8790-5409-1239-bcd9e8d28b8e"
}
```

Use the [Retrieve async operation](#retrieve-async-operation) endpoint with the `id` in the response to determine the status of the async operation.

## Bulk Reingest

Reingest the granules provided. Granules can be sent as a list of IDs or as an Elasticsearch query to the Metrics' Elasticsearch.

Overview of the request fields:

| Field | Required | Value | Description |
| --- | --- | --- | --- |
| `granules` | `yes` - if `query` not present | `Array<object>` | List of Granules to process e.g. { granuleId, collectionId }. Required if there is no Elasticsearch query provided |
| `index` | `yes` - if `query` is present | `string` | Elasticsearch index to search with the given query |
| `query` | `yes` - if `ids` not present | `Object` | Query to Elasticsearch to determine which Granules to be reingested. Required if no Granules are given. |
| `knexDebug` |  `N` | `bool` | Sets knex postgreSQL connection pool/query debug output.  Defaults to false |
| `workflowName` | `no` | `string` | optional workflow name that allows different workflow and initial input to be used during reingest. See below.  |

An optional data parameter of `workflowName` is also available to allow you to override the input message to the reingest. If `workflowName` is specified, the original message is pulled directly
by finding the most recent execution of the workflowName associated with the granuleId.


```endpoint
POST /granules/bulkReingest
```

#### Example request with Elasticsearch query generated by Kibana:

```curl
$ curl --request POST \
    https://example.com/granules/bulkReingest --header 'Authorization: Bearer ReplaceWithTheToken' \
  --header 'Content-Type: application/json' \
  --data '{
        "index": "index-in-es",
        "query": {
            "size": 500,
            "query": {
                "filter": [
                    {
                        "bool": {
                            "filter": [
                                {
                                    "bool": {
                                        "should": [{"match": {"granuleId": "MOD09GQ.A2016358.h13v04.006.2016360104606"}}],
                                        "minimum_should_match": 1
                                    }
                                },
                                {
                                    "bool": {
                                        "should": [{"match": {"status": "FAILED"}}],
                                        "minimum_should_match": 1
                                    }
                                }
                            ]
                        }
                    }
                ],
                "should": [],
                "must_not": []
            }
        }
    }'
```

#### Example request with given Granules and optional workflow parameter:

```curl
curl -X POST
  https://example.com/granules/bulkReingest
  --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json'
  --data '{
        "granules": [ { "granuleId": "MOD09GQ.A2016358.h13v04.006.2016360104606", "collectionId": "MOD11A1___006" } ],
        "workflow": "workflowName",
        }'
```

#### Example response

```json
{
    "id": "0eb8e809-8790-5409-1239-bcd9e8d28b8e"
}
```

Use the [Retrieve async operation](#retrieve-async-operation) endpoint with the `id` in the response to determine the status of the async operation.

## Bulk Update Granules CollectionId

Updates a batch of existing granules' linked collection (`collectionId`) in postgres and ES. Expects payload to contain a list of granules, a new collectionId to update them to, and an optional `esConcurrency` value that allows modification of concurrent Elasticsearch requests utilized by the endpoint. 

This endpoint will fail if non-existant granuleIds are provided, it can only be used to change existing granules' collectionId in both datastores.

Returns status 200 on successful update, 404 if the `granuleId` can not be found in the database, 
or 400 for datastore write or validation errors.

**Note**: For elastic search enabled versions of Cumulus, if writes from this endpoint fail, there is a high risk that the postgres and elasticsearch datastores will be out of sync for some (but not all ) of the granuleIds requested for update. 

If a write failure occurs, the endpoint is idempotent so the operation can be re-run and should correct the discrepancy.     

```endpoint
PATCH /granules/bulkPatchGranuleCollection
```

#### Example request

```curl
$ curl --request PATCH https://example.com/granules/bulkPatchGranuleCollection \
  --header 'Authorization: Bearer ReplaceWithTheToken' \
  --header 'Content-Type: application/json' \
  --header 'Cumulus-API-Version: 2' \
 --data '{
    "apiGranules": [{
        "granuleId": "granuleId.A20200113.006.1005",
        "collectionId: "collectionId.A20200113.006",
        "files": [...],
        "duration": 1000,
        "status": "completed"
  }, {
        "granuleId": "granuleId.A20200113.006.1006",
        "collectionId: "collectionId.A20200113.006",
        "files": [...],
        "duration": 1000,
        "status": "completed"
  },...,
    {
        "granuleId": "granuleId.A20200113.006.1100",
        "collectionId: "collectionId.A20200113.006",
        "files": [...],
        "duration": 1000,
        "status": "completed"
  }}],
    "collectionId": "collectionId.B31311224.007",
    "esConcurrency": 10,
}'
```

#### Example response

```json
{ "message": "Successfully wrote granules with Granule Id: ['granuleId.A20200113.006.1005', 'granuleId.A20200113.006.1006',...,'granuleId.A20200113.006.1100'], Collection Id: 'collectionId.B31311224.007'" }
```

## Bulk Update Granules

Update a batch of granules. Expects payload to contain a list of the modified
granules as the existing granule values will be overwritten by the
modified portions. Please see the `Update Granule` [endpoint](#update-granule) for additional details. Configuration for `dbConcurrency`, a configurable postgres database concurrency for the request, and `dbMaxPool`, the maximum number of postgres connections the request can make, is provided
for improved database performance tuning.

Returns status 200 on successful update, 201 on new granule creation, 404 if
the `granuleId` can not be found in the database, or 400 for database write or validation errors.

**Please Note**: If this endpoint fails on granule update for a batch, some of the batched granules may not be updated.  This endpoint does not provide granular update results for each granule (as a feature design boundary) or other retry logic, that update is anticipated in future releases. 

If a write failure occurs, as this is an update, correct the failure and re-attempt the batch write to resolve. 
When a failure occurs, a potential resolution includes re-running the endpoint.

```endpoint
PATCH /granules/bulkPatch
```

#### Example request

```curl
$ curl --request PATCH https://example.com/granules/bulkPatch \
  --header 'Authorization: Bearer ReplaceWithTheToken' \
  --header 'Content-Type: application/json' \
  --header 'Cumulus-API-Version: 2' \
 --data '{
    "apiGranules": [{
        "granuleId": "granuleId.A20200113.006.1005",
        "collectionId: "collectionId.B31311224.007",
        "files": [
            {
                "bucket": "stack-protected",
                "key": "granuleId.B31311224.007.1005.hdf",
                "fileName": "granuleId.B31311224.007.1005.hdf"
            },
            {
                "bucket": "stack-protected",
                "key": "granuleId.B31311224.007.1005.jpg",
                "fileName": "granuleId.B31311224.007.1005.jpg"
            }
        ],
        "duration": 1000,
        "status": "completed"
        }, 
        {
        "granuleId": "granuleId.A20200113.006.1006",
        "collectionId: "collectionId.B31311224.007",
        "files": [
            {
                "bucket": "stack-protected",
                "key": "granuleId.B31311224.007.1006.hdf",
                "fileName": "granuleId.B31311224.007.1006.hdf"
            },
            {
                "bucket": "stack-protected",
                "key": "granuleId.B31311224.007.1006.jpg",
                "fileName": "granuleId.B31311224.007.1006.jpg"
            },
            {
                "bucket": "stack-protected",
                "key": "granuleId.B31311224.007.1006.txt",
                "fileName": "granuleId.B31311224.007.1006.txt"
            }
        ],
        "duration": 1000,
        "status": "completed"
        },...,
        {
        "granuleId": "granuleId.A20200113.006.1100",
        "collectionId: "collectionId.B31311224.007",
        "files": [
            {
                "bucket": "stack-protected",
                "key": "granuleId.B31311224.007.1100.hdf",
                "fileName": "granuleId.B31311224.007.1100.hdf"
            },
            {
                "bucket": "stack-protected",
                "key": "granuleId.B31311224.007.1100.jpg",
                "fileName": "granuleId.B31311224.007.1100.jpg"
            }
        ],
        "duration": 1000,
        "status": "completed"
    }],
    dbConcurrency: 10,
    dbMaxPool: 20,
}'
```

#### Example response

```json
{ "message": "Successfully patched Granules" }
```
