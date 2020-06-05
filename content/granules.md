## List granules

List granules in the Cumulus system.

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
            "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:433612427488:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:7f071dae1a93c9892272b7fd5",
            "files": [
                {
                    "bucket": "cumulus-devseed-protected",
                    "path": "/TEST_B/Cumulus/MODIS/DATA",
                    "checksumValue": 964704694,
                    "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "fileSize": 1447347,
                    "fileType": "data",
                    "checksumType": "CKSUM",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "url_path": ""
                },
                {
                    "bucket": "cumulus-devseed-private",
                    "path": "/TEST_B/Cumulus/MODIS/DATA",
                    "checksumValue": 121318124,
                    "filename": "s3://cumulus-devseed-private/MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
                    "fileSize": 22559,
                    "fileType": "metadata",
                    "checksumType": "CKSUM",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
                    "url_path": ""
                },
                {
                    "bucket": "cumulus-devseed-private",
                    "path": "/TEST_B/Cumulus/MODIS/DATA",
                    "checksumValue": 2188150664,
                    "filename": "s3://cumulus-devseed-private/BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "fileSize": 18118,
                    "fileType": "data",
                    "checksumType": "CKSUM",
                    "name": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "url_path": ""
                },
                {
                    "bucket": "cumulus-devseed-protected",
                    "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "fileType": "data",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
                },
                {
                    "bucket": "cumulus-devseed-public",
                    "filename": "s3://cumulus-devseed-public/MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg",
                    "fileType": "browse",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg"
                },
                {
                    "bucket": "cumulus-devseed-protected",
                    "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
                    "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml",
                    "fileType": "metadata",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml"
                },
                {
                    "bucket": "cumulus-devseed-public",
                    "filename": "s3://cumulus-devseed-public/MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg",
                    "fileType": "browse",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg"
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
    "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:433612427488:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:7f071dae1a93c9892272b7fd5",
    "files": [
        {
            "bucket": "cumulus-devseed-protected",
            "path": "/TEST_B/Cumulus/MODIS/DATA",
            "checksumValue": 964704694,
            "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "fileSize": 1447347,
            "checksumType": "CKSUM",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "url_path": ""
        },
        {
            "bucket": "cumulus-devseed-private",
            "path": "/TEST_B/Cumulus/MODIS/DATA",
            "checksumValue": 121318124,
            "filename": "s3://cumulus-devseed-private/MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
            "fileSize": 22559,
            "checksumType": "CKSUM",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
            "url_path": ""
        },
        {
            "bucket": "cumulus-devseed-private",
            "path": "/TEST_B/Cumulus/MODIS/DATA",
            "checksumValue": 2188150664,
            "filename": "s3://cumulus-devseed-private/BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "fileSize": 18118,
            "checksumType": "CKSUM",
            "name": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "url_path": ""
        },
        {
            "bucket": "cumulus-devseed-protected",
            "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
        },
        {
            "bucket": "cumulus-devseed-public",
            "filename": "s3://cumulus-devseed-public/MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg"
        },
        {
            "bucket": "cumulus-devseed-protected",
            "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
            "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml"
        },
        {
            "bucket": "cumulus-devseed-public",
            "filename": "s3://cumulus-devseed-public/MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg"
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

Reingest a granule. This causes the granule to re-download to Cumulus from source, and begin processing from scratch.  Reingesting a granule will overwrite existing granule files.

```endpoint
PUT /granules/{granuleId}
```

#### Example request

```curl
$ curl --request PUT https://example.com/granules/MOD11A1.A2017137.h20v17.006.2017138085755 --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{"action": "reingest"}'
```

#### Example response

A warning message is included in the response if the collection's duplicateHandling is not set to 'replace'.

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
| `queueName` | `N` | `string` | Queue to process Granules in |
| `ids` | `Y` - if no `query` | `Array<string>` | List of IDs to process. Required if there is no Elasticsearch query provided |
| `query` | `Y` - if no `ids` | `Object` | Query to Elasticsearch to determine which Granules to go through given workflow. Required if no IDs are given. |
| `index` | `Y` - if `query` is present | `string` | Elasticsearch index to search with the given query |


```endpoint
POST /granules/bulk
```

#### Example request with Elasticsearch query generated by Kibana:

```curl
$ curl --request POST \
    https://example.com/granules/bulk --header 'Authorization: Bearer ReplaceWithTheToken' \
  --data '{
        "workflowName": "HelloWorldWorkflow",
        index: "index-in-es",
        query": {
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
  https://example.com/granules/bulk --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"ids": ["MOD09GQ.A2016358.h13v04.006.2016360104606"], "workflowName": "HelloWorldWorkflow"}'
```

#### Example response

```json
{
    "createdAt": 1574730504000,
    "id": "0eb8e809-8790-5409-1239-bcd9e8d28b8e",
    "updatedAt": 1574730504762,
    "status": "RUNNING",
    "taskArn": "arn:aws:ecs:us-east-1:111111111111:task/d481e76e-f5fc-9c1c-2411-fa13779b111a"
}
```

## Bulk Delete

Bulk delete the provided granules. Granules can be sent as a list of IDs or as an Elasticsearch query to the Metrics' Elasticsearch.

Overview of the request fields:

| Field | Required | Value | Description |
| --- | --- | --- | --- |
| `forceRemoveFromCmr` | `N` | `bool` | Whether to remove published granules from CMR before deletion. **You must set this value to `true` to do bulk deletion of published granules, otherwise deleting them will fail.**
| `ids` | `Y` - if no `query` | `Array<string>` | List of IDs to process. Required if there is no Elasticsearch query provided |
| `query` | `Y` - if no `ids` | `Object` | Query to Elasticsearch to determine which Granules to delete. Required if no IDs are given. |
| `index` | `Y` - if `query` is present | `string` | Elasticsearch index to search with the given query |

```endpoint
POST /granules/bulkDelete
```

#### Example request with Elasticsearch query generated by Kibana:

```curl
$ curl --request POST \
    https://example.com/granules/bulkDelete --header 'Authorization: Bearer ReplaceWithTheToken' \
  --data '{
        "forceRemoveFromCmr": true,
        index: "index-in-es",
        query": {
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
    "taskArn": "arn:aws:ecs:us-east-1:111111111111:task/d481e76e-f5fc-9c1c-2411-fa13779b111a"
}
```
