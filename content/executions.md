## List executions
List executions.

```endpoint
GET /executions
```

#### Example request

```curl
$ curl https://example.com/executions?limit=3 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "meta": {
    "name": "cumulus-api",
    "stack": "test-src-integration",
    "table": "execution",
    "limit": 3,
    "page": 1,
    "count": 447
  },
  "results": [
    {
      "arn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:08aa40f8-7d91-41b4-986e-d12ce495aec5",
      "duration": 1.693,
      "createdAt": 1534443719571,
      "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:08aa40f8-7d91-41b4-986e-d12ce495aec5",
      "name": "08aa40f8-7d91-41b4-986e-d12ce495aec5",
      "error": {},
      "type": "IngestGranule",
      "collectionId": "MOD09GQ___006",
      "tasks": {},
      "status": "running",
      "timestamp": 1534443721559,
      "updatedAt": 1534443721265
    },
    {
      "arn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:bee18782-e987-4bd4-b726-41669e489e2f",
      "duration": 1.718,
      "createdAt": 1534443706867,
      "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:bee18782-e987-4bd4-b726-41669e489e2f",
      "name": "bee18782-e987-4bd4-b726-41669e489e2f",
      "error": {},
      "type": "IngestGranule",
      "collectionId": "MOD09GQ___006",
      "tasks": {},
      "status": "running",
      "timestamp": 1534443709043,
      "updatedAt": 1534443708585
    },
    {
      "arn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:55d62b27-50cd-4cc1-81f9-e425cf10532e",
      "duration": 29.397,
      "createdAt": 1534443668185,
      "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:55d62b27-50cd-4cc1-81f9-e425cf10532e",
      "name": "55d62b27-50cd-4cc1-81f9-e425cf10532e",
      "error": {
        "Cause": "None",
        "Error": "Unknown Error"
      },
      "type": "IngestGranule",
      "collectionId": "MOD09GQ___006",
      "tasks": {},
      "status": "completed",
      "timestamp": 1534443698322,
      "updatedAt": 1534443697582
    }
  ]
}
```

## Retrieve Execution

Retrieve details for a specific execution.

```endpoint
GET /executions/{executionArn}
```

#### Example request

```curl
$ curl https://example.com/executions/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735",
    "updatedAt": 1534441782302,
    "status": "completed",
    "timestamp": 1534441782302,
    "tasks":
    {
        "MoveGranuleStep":
        {
            "name": "test-src-integration-MoveGranules",
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:test-src-integration-MoveGranules",
            "version": "$LATEST"
        },
        "ProcessingStep":
        {
            "name": "test-src-integration-FakeProcessing",
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:test-src-integration-FakeProcessing",
            "version": "$LATEST"
        },
        "StopStatus":
        {
            "name": "test-src-integration-SfSnsReport",
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:test-src-integration-SfSnsReport",
            "version": "$LATEST"
        }
    },
    "createdAt": 1534441752026,
    "duration": 30.276,
    "name": "cff1266e-ef36-664f-a649-3a4d26bd1735",
    "arn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735",
    "collectionId": "MOD09GQ___006",
    "error":
    {
        "Error": "Unknown Error",
        "Cause": "None"
    },
    "type": "IngestGranule",
    "originalPayload": { "somePayloadKey": "object containing payload at execution start" },
    "finalPayload": { "somePayloadKey" : "object containing the last reported payload from an execution" }
}
```


## Retrieve Execution Status

Retrieve details and status of a specific execution. This also returns execution history and details of the state machine when the execution exists in Step Function API.

```endpoint
GET /executions/status/{executionArn}
```

#### Example request

```curl
$ curl https://example.com/executions/status/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl6sgv:d0a6584b-bea6-476e-a745-c1feb2ad00b2 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "presignedS3Url": "https://example.amazonaws.com/example",
  "data": "Execution status data, see example below"
}
```

```json
{
  "presignedS3Url": "https://example.amazonaws.com/example",
  "data": "Error: Execution Status for execution123 exceeded maximum allowed payload size"
}
```

#### Execution status

```json
{
    "execution":
    {
        "executionArn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl4sgv:d0a6584b-bea6-476e-a745-c1feb2ad00b2",
        "stateMachineArn": "arn:aws:states:us-east-1:123456789012:stateMachine:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl4sgv",
        "name": "d0a6584b-bea6-476e-a745-c1feb2ad00b2",
        "status": "SUCCEEDED",
        "startDate": "2018-08-16T18:39:32.209Z",
        "stopDate": "2018-08-16T18:39:59.089Z",
        "input":
        {
            "foo": "input"
        },
        "output":
        {
            "bar": "output"
        }
    },
    "executionHistory":
    {
        "events":
        [
            {
                "taskName": "foo bar 1"
            },
            {
                "taskName": "foo bar 2"
            }
        ]
    },
    "stateMachine":
    {
        "stateMachineArn": "arn:aws:states:us-east-1:123456789012:stateMachine:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl4sgv",
        "name": "TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl4sgv",
        "status": "ACTIVE",
        "definition":
        {
            "Comment": "Ingest Granule",
            "StartAt": "First State",
            "States":
            {
                "First State": {}
            }
        },
        "roleArn": "arn:aws:iam::123456789012:role/test-src-integration-steprole",
        "creationDate": "2018-06-11T16:08:17.533Z"
    }
}

```

## Search Executions By Granules

Return executions associated with specific granules. Granules can be sent as a list of granule objects containing granuleIds and collectionIds or as an Elasticsearch query to the Metrics' Elasticsearch.

Overview of the request fields:

| Field | Required | Value | Description |
| --- | --- | --- | --- |
| `granules` | `yes` - if `query` not present | `Array<Object>` | List of granules to process. Each granule must contain a granuleId and collectionId |
| -- `granule.granuleId` | `yes` - if using `granules` | `string` | GranuleId for a granule |
| -- `granule.collectionId` | `yes` - if using `granules` | `string` | CollectionId for a granule |
| `query` | `yes` - if `granules` not present | `Object` | Query to Elasticsearch to determine which Granules with which to search. Required if no IDs are given. |
| `index` | `yes` - if `query` is present | `string` | Elasticsearch index to search with the given query |

```endpoint
POST /executions/search-by-granules
```

#### Example request with given Granules:

```curl
curl -X POST
  https://example.com/executions/search-by-granules?limit=3 --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{"granules": [{ "granuleId":"MOD09GQ.A2016358.h13v04.006.2016360104606", "collectionId": "MOD09GQ___006"}]}'
```
#### Example request with Elasticsearch query generated by Kibana:

```curl
$ curl --request POST \
    https://example.com/executions/search-by-granules?limit=3 --header 'Authorization: Bearer ReplaceWithTheToken' \
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
                                        "should": [{"match": {"collectionId": "MOD09GQ__006"}}],
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

#### Example response

```json
{
   "meta": {
       "count": 3
    },
    "results": [
        {
            "arn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:08aa40f8-7d91-41b4-986e-d12ce495aec5",
            "duration": 1.693,
            "createdAt": 1534443719571,
            "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:08aa40f8-7d91-41b4-986e-d12ce495aec5",
            "name": "08aa40f8-7d91-41b4-986e-d12ce495aec5",
            "error": {},
            "type": "IngestGranule",
            "collectionId": "MOD09GQ___006",
            "tasks": {},
            "status": "running",
            "timestamp": 1534443721559,
            "updatedAt": 1534443721265
        },
        {
            "arn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:bee18782-e987-4bd4-b726-41669e489e2f",
            "duration": 1.718,
            "createdAt": 1534443706867,
            "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:bee18782-e987-4bd4-b726-41669e489e2f",
            "name": "bee18782-e987-4bd4-b726-41669e489e2f",
            "error": {},
            "type": "IngestGranule",
            "collectionId": "MOD09GQ___006",
            "tasks": {},
            "status": "running",
            "timestamp": 1534443709043,
            "updatedAt": 1534443708585
        },
        {
            "arn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:55d62b27-50cd-4cc1-81f9-e425cf10532e",
            "duration": 29.397,
            "createdAt": 1534443668185,
            "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:55d62b27-50cd-4cc1-81f9-e425cf10532e",
            "name": "55d62b27-50cd-4cc1-81f9-e425cf10532e",
            "error": {
            "Cause": "None",
            "Error": "Unknown Error"
            },
            "type": "IngestGranule",
            "collectionId": "MOD09GQ___006",
            "tasks": {},
            "status": "completed",
            "timestamp": 1534443698322,
            "updatedAt": 1534443697582
        }
    ]
}

```

## Workflows By Granules

Return the workflows that have run on specific granules. If multiple granules are specified, it will return the intersection of workflows that have run on ALL the granules. That is, only a workflow that has been run on every inputted granule will be returned

Overview of the request fields:

| Field | Required | Value | Description |
| --- | --- | --- | --- |
| `granules` | `yes` - if `query` not present | `Array<Object>` | List of granules to process. Each granule must contain a granuleId and collectionId |
| -- `granule.granuleId` | `yes` - if using `granules` | `string` | GranuleId for a granule |
| -- `granule.collectionId` | `yes` - if using `granules` | `string` | CollectionId for a granule |
| `query` | `yes` - if `granules` not present | `Object` | Query to Elasticsearch to determine which Granules with which to search. Required if no IDs are given. |
| `index` | `yes` - if `query` is present | `string` | Elasticsearch index to search with the given query |

```endpoint
POST /executions/workflows-by-granules
```

#### Example request with given Granules:

```curl
curl -X POST
  https://example.com/executions/workflows-by-granules --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{"granules": [{ "granuleId":"MOD09GQ.A2016358.h13v04.006.2016360104606", "collectionId": "MOD09GQ___006"}]}'
```
#### Example request with Elasticsearch query generated by Kibana:

```curl
$ curl --request POST \
    https://example.com/executions/workflows-by-granules --header 'Authorization: Bearer ReplaceWithTheToken' \
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
                                        "should": [{"match": {"collectionId": "MOD09GQ__006"}}],
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

#### Example response

```json
[
    "DiscoverGranules",
    "IngestGranules"
]

```

## Create execution

Create an execution. An execution generally includes the fields listed below.

Overview of the schema fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `arn` | `string` | `yes` | execution arn (this field is unique) |
| `asyncOperationId` | `string` | `no` | `id` of the associated async operation |
| `collectionId` | `string` | `no` | collectionId of the associated collection (e.g. `<name>___<version>` where `<name>` is the collection name and `<version>` is the collection version) |
| `cumulusVersion` | `string` | `no` | cumulus version for the execution (e.g. `9.0.0`) |
| `duration` | `number` | `no` | duration of the execution |
| `error` | `object` | `no` | the error details in case of a failed execution |
| `execution` | `string` | `no` | the execution page url on AWS console |
| `finalPayload` | `object` | `no` | the final payload of this execution |
| `name` | `string` | `yes` | execution name |
| `originalPayload` | `object` | `no` | the original payload for this execution |
| `parentArn` | `string` | `no` | arn of the parent execution |
| `status` | `string` | `yes` | the execution status, possible values: `running`, `completed`, `failed`, `unknown` |
| `tasks` | `object` | `no` | the tasks for this execution |
| `type` | `string` | `no` | the workflow name, e.g. IngestGranule |
| `timestamp` | `number` | `no` | the timestamp for this execution |

```endpoint
POST /executions
```

#### Example request

```curl
$ curl --request POST https://example.com/executions --header 'Authorization: Bearer ReplaceWithToken' --header 'Content-Type: application/json' --data '{
    "arn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735",
    "asyncOperationId": "c4ece1f9-dca0-42f8-be77-da43b9b25918",
    "collectionId": "MOD09GQ___006",
    "cumulusVersion": "1.2.3",
    "error": {},
    "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735",
    "name": "cff1266e-ef36-664f-a649-3a4d26bd1735",
    "originalPayload": { "somePayloadKey": "object containing payload at execution start" },
    "parentArn": "arn:aws:states:us-east-1:123456789012:execution:test-src-integration-ParsePdr:59edd6a4-5187-4865-b3c3-71ebcf76d7a1",
    "status": "running",
    "tasks":
    {
        "MoveGranuleStep":
        {
            "name": "test-src-integration-MoveGranules",
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:test-src-integration-MoveGranules",
            "version": "$LATEST"
        },
        "ProcessingStep":
        {
            "name": "test-src-integration-FakeProcessing",
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:test-src-integration-FakeProcessing",
            "version": "$LATEST"
        },
        "StopStatus":
        {
            "name": "test-src-integration-SfSnsReport",
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:test-src-integration-SfSnsReport",
            "version": "$LATEST"
        }
    },
    "type": "IngestGranule",
    "timestamp": 1513020462156
}'
```

#### Example response

```json
{
    "message": "Successfully wrote execution with arn arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735"
}
```

## Update or replace execution

Update/replace an existing execution. Expects payload to specify the entire
execution object, and will completely replace the existing execution with the
specified payload. For a field reference see
["Create execution"](#create-execution).

Returns status 200 on successful replacement, 400 if the `arn`
property in the payload does not match the corresponding value in the resource
URI, or 404 if there is no execution with the specified arn.

```endpoint
PUT /executions/{executionArn}
```

#### Example request

```curl
$ curl --request PUT https://example.com/executions/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735 --header 'Authorization: Bearer ReplaceWithToken' --header 'Content-Type: application/json' --data '{
    "arn": "arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735",
    "asyncOperationId": "c4ece1f9-dca0-42f8-be77-da43b9b25918",
    "collectionId": "MOD09GQ___006",
    "cumulusVersion": "1.2.3",
    "duration": 30.276,
    "error": {},
    "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735",
    "finalPayload": { "somePayloadKey" : "object containing the last reported payload from an execution" },
    "name": "cff1266e-ef36-664f-a649-3a4d26bd1735",
    "originalPayload": { "somePayloadKey": "object containing payload at execution start" },
    "parentArn": "arn:aws:states:us-east-1:123456789012:execution:test-src-integration-ParsePdr:59edd6a4-5187-4865-b3c3-71ebcf76d7a1",
    "status": "completed",
    "tasks":
    {
        "MoveGranuleStep":
        {
            "name": "test-src-integration-MoveGranules",
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:test-src-integration-MoveGranules",
            "version": "$LATEST"
        },
        "ProcessingStep":
        {
            "name": "test-src-integration-FakeProcessing",
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:test-src-integration-FakeProcessing",
            "version": "$LATEST"
        },
        "StopStatus":
        {
            "name": "test-src-integration-SfSnsReport",
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:test-src-integration-SfSnsReport",
            "version": "$LATEST"
        }
    },
    "type": "IngestGranule",
    "timestamp": 1513020462156
}'
```

#### Example response

```json
{
    "message": "Successfully updated execution with arn arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735"
}
```

## Delete execution

Delete an execution from Cumulus.

```endpoint
DELETE /executions/{executionArn}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/executions/arn:aws:states:us-east-1:123456789012:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "message": "Record deleted"
}
```
