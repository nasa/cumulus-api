## List granules

List granules in the Cumulus system.
If the query includes a value of `true` for `getRecoveryStatus`, `recoveryStatus` will be included in each granule's return value when applicable.

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
        "count": 8
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

Retrieve a single granule.
If the query includes a value of `true` for `getRecoveryStatus`, the returned granule will include `recoveryStatus` when applicable.

```endpoint
GET /granules/{granuleId}
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
    "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:433612427488123456789012:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:7f071dae1a93c9892272b7fd5",
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
both are present, workflowName is ignored and executionArn is used to determing
the input message to the reingest.


```endpoint
PUT /granules/{granuleId}
```

#### Example request

```curl
$ curl --request PUT https://example.com/granules/MOD11A1.A2017137.h20v17.006.2017138085755
       --header 'Authorization: Bearer ReplaceWithTheToken'
       --header 'Content-Type: application/json'
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
PUT /granules/{granuleid}
```

#### Example request

```curl
$ curl --request PUT https://example.com/granules/MOD11A1.A2017137.h19v16.006.2017138085750 --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{ "action": "applyWorkflow", "workflow": "inPlaceWorkflow" }'
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
PUT /granules/{granuleId}
```

#### Example request

```curl
$ curl --request PUT https://example.com/granules/MOD11A1.A2017137.h19v16.006.2017138085750 --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{ "action": "move", "destinations": [{ "regex": ".*.hdf$", "bucket": "s3-bucket", "filepath": "new/filepath/" }]}'
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
PUT /granules/{granuleId}
```

#### Example request

```curl
$ curl --request PUT https://example.com/granules/MOD11A1.A2017137.h19v16.006.2017138085750 --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{"action": "removeFromCmr"}'
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

```endpoint
DELETE /granules/{granuleId}
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
| `workflow` | `Y` | `string` | Worfklow to be applied to all granules |
| `queueUrl` | `N` | `string` | URL of SQS queue to use for scheduling granule workflows (e.g. `https://sqs.us-east-1.amazonaws.com/12345/queue-name`) |
| `ids` | `yes` - if `query` not present | `Array<string>` | List of IDs to process. Required if there is no Elasticsearch query provided |
| `query` | `yes` - if `ids` not present | `Object` | Query to Elasticsearch to determine which Granules to go through given workflow. Required if no IDs are given. |
| `index` | `yes` - if `query` is present | `string` | Elasticsearch index to search with the given query |


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

#### Example request with given Granule IDs:

```curl
curl -X POST
  https://example.com/granules/bulk --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{"ids": ["MOD09GQ.A2016358.h13v04.006.2016360104606"], "workflowName": "HelloWorldWorkflow"}'
```

#### Example response

```json
{
    "createdAt": 1574730504000,
    "id": "0eb8e809-8790-5409-1239-bcd9e8d28b8e",
    "updatedAt": 1574730504762,
    "status": "RUNNING",
    "taskArn": "arn:aws:ecs:us-east-1:123456789012:task/d481e76e-f5fc-9c1c-2411-fa13779b111a"
}
```

Use the [Retrieve async operation](#retrieve-async-operation) endpoint with the `id` in the response to determine the status of the async operation.

## Bulk Delete

Bulk delete the provided granules. Granules can be sent as a list of IDs or as an Elasticsearch query to the Metrics' Elasticsearch.

Overview of the request fields:

| Field | Required | Value | Description |
| --- | --- | --- | --- |
| `forceRemoveFromCmr` | `N` | `bool` | Whether to remove published granules from CMR before deletion. **You must set this value to `true` to do bulk deletion of published granules, otherwise deleting them will fail.**
| `ids` | `yes` - if `query` not present | `Array<string>` | List of IDs to process. Required if there is no Elasticsearch query provided |
| `query` | `yes` - if `ids` not present | `Object` | Query to Elasticsearch to determine which Granules to delete. Required if no IDs are given. |
| `index` | `yes` - if `query` is present | `string` | Elasticsearch index to search with the given query |

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

#### Example request with given Granule IDs:

```curl
curl -X POST
  https://example.com/granules/bulkDelete --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"ids": ["MOD09GQ.A2016358.h13v04.006.2016360104606"], "forceRemoveFromCmr": true}'
```

#### Example response

```json
{
    "createdAt": 1574730504000,
    "id": "0eb8e809-8790-5409-1239-bcd9e8d28b8e",
    "updatedAt": 1574730504762,
    "status": "RUNNING",
    "taskArn": "arn:aws:ecs:us-east-1:111111111111123456789012:task/d481e76e-f5fc-9c1c-2411-fa13779b111a"
}
```

Use the [Retrieve async operation](#retrieve-async-operation) endpoint with the `id` in the response to determine the status of the async operation.

## Bulk Reingest

Reingest the granules provided. Granules can be sent as a list of IDs or as an Elasticsearch query to the Metrics' Elasticsearch.

Overview of the request fields:

| Field | Required | Value | Description |
| --- | --- | --- | --- |
| `ids` | `yes` - if `query` not present | `Array<string>` | List of IDs to process. Required if there is no Elasticsearch query provided |
| `query` | `yes` - if `ids` not present | `Object` | Query to Elasticsearch to determine which Granules to be reingested. Required if no IDs are given. |
| `index` | `yes` - if `query` is present | `string` | Elasticsearch index to search with the given query |


An optional data parameter of `executionArn` is also available to allow you to override the input message to the reingest. If `executionArn` is specified, the original message is pulled directly
from that execution and used in reingest.


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

#### Example request with given Granule IDs and executionArn optional parameter:

```curl
curl -X POST
  https://example.com/granules/bulkReingest
  --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json'
   --data '{
        "ids": ["MOD09GQ.A2016358.h13v04.006.2016360104606"],
        "executionArn": "arn:aws:states:us-east-1:1234567890123456789012:execution:stack-lambdaName:9da47a3b-4d85-4599-ae78-dbec2e042520",
        }'
```

#### Example response

```json
{
    "createdAt": 1574730504000,
    "description": "Bulk granule reingest run on 2 granules",
    "id": "0eb8e809-8790-5409-1239-bcd9e8d28b8e",
    "operationType": "Bulk Granule Reingest",
    "status": "RUNNING",
    "taskArn": "arn:aws:ecs:us-east-1:111111111111123456789012:task/d481e76e-f5fc-9c1c-2411-fa13779b111a",
    "updatedAt": 1574730504762
}
```

Use the [Retrieve async operation](#retrieve-async-operation) endpoint with the `id` in the response to determine the status of the async operation.
