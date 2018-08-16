## List executions
List executions.

```endpoint
GET /v1/executions
```

#### Example request

```curl
$ curl https://example.com/v1/executions?limit=3 --header 'Authorization: Bearer ReplaceWithTheToken'
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
      "arn": "arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:08aa40f8-7d91-41b4-986e-d12ce495aec5",
      "duration": 1.693,
      "createdAt": 1534443719571,
      "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:08aa40f8-7d91-41b4-986e-d12ce495aec5",
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
      "arn": "arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:bee18782-e987-4bd4-b726-41669e489e2f",
      "duration": 1.718,
      "createdAt": 1534443706867,
      "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:bee18782-e987-4bd4-b726-41669e489e2f",
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
      "arn": "arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:55d62b27-50cd-4cc1-81f9-e425cf10532e",
      "duration": 29.397,
      "createdAt": 1534443668185,
      "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:55d62b27-50cd-4cc1-81f9-e425cf10532e",
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
GET /v1/executions/{executionName}
```

#### Example request

```curl
$ curl https://example.com/v1/executions/cff1266e-ef36-664f-a649-3a4d26bd1735 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735",
    "updatedAt": 1534441782302,
    "status": "completed",
    "timestamp": 1534441782302,
    "tasks": {??},
    "createdAt": 1534441752026,
    "duration": 30.276,
    "name": "cff1266e-ef36-664f-a649-3a4d26bd1735",
    "arn": "arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl2sgv:cff1266e-ef36-664f-a649-3a4d26bd1735",
    "collectionId": "MOD09GQ___006",
    "error":
    {
        "Error": "Unknown Error",
        "Cause": "None"
    },
    "type": "IngestGranule"
}
```


## Retrieve Execution Status

Retrieve details and status of a specific execution. This also return details of the state machine.

```endpoint
GET /v1/executions/status/{executionArn}
```

#### Example request

```curl
$ curl https://example.com/v1/executions/status/arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl6sgv:d0a6584b-bea6-476e-a745-c1feb2ad00b2 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "execution":
    {
        "executionArn": "arn:aws:states:us-east-1:596205514284:execution:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl6sgv:d0a6584b-bea6-476e-a745-c1feb2ad00b2",
        "stateMachineArn": "arn:aws:states:us-east-1:596205514284:stateMachine:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl6sgv",
        "name": "d0a6584b-bea6-476e-a745-c1feb2ad00b2",
        "status": "SUCCEEDED",
        "startDate": "2018-08-16T18:39:32.209Z",
        "stopDate": "2018-08-16T18:39:59.089Z",
        "input":
        {
            // Full input for execution
        },
        "output":
        {
            // Full output for execution
        }
    },
    "executionHistory":
    {
        "events": [] // Array of events in the execution
    },
    "stateMachine":
    {
        "stateMachineArn": "arn:aws:states:us-east-1:596205514284:stateMachine:TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl6sgv",
        "name": "TestSrcIntegrationIngestGranuleStateMachine-UhCSmszl6sgv",
        "status": "ACTIVE",
        "definition":
        {
            // definition of state machine
        },
        "roleArn": "arn:aws:iam::596205514284:role/test-src-integration-steprole",
        "creationDate": "2018-06-11T16:08:17.533Z"
    }
}

```