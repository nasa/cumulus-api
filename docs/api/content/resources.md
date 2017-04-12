## List resources

List Amazon Web Services resources consumed by the Cumulus system.

```endpoint
GET /resources
```

#### Example request

```curl
$ curl https://cumulus.developmentseed.org/api/dev/resources --header 'Authorization: tokentakenfromsinginendpoint'
```

#### Example response

```json
{
  "s3": [
    {
      "bucket": "cumulus-private",
      "Sum": 770681495866,
      "Unit": "Bytes",
      "Timestamp": {}
    },
    {
      "bucket": "cumulus-public",
      "Sum": 1625772229,
      "Unit": "Bytes",
      "Timestamp": {}
    },
    {
      "bucket": "cumulus-protected",
      "Sum": 2720993174445,
      "Unit": "Bytes",
      "Timestamp": {}
    },
    {
      "bucket": "cumulus-internal",
      "Sum": 2688662529050,
      "Unit": "Bytes",
      "Timestamp": {}
    }
  ],
  "createdAt": 1492021453507,
  "instances": [
    {
      "pendingTasks": 0,
      "availableMemory": 6450,
      "availableCpu": 1993,
      "id": "i-084ebffda1e5f4f6c",
      "runningTasks": 4,
      "status": "ACTIVE"
    },
    {
      "pendingTasks": 0,
      "availableMemory": 6450,
      "availableCpu": 1993,
      "id": "i-04e019987a688d0ed",
      "runningTasks": 4,
      "status": "ACTIVE"
    }
  ],
  "queues": [
    {
      "messagesAvailable": "0",
      "name": "cumulus-api-lpdaac-dev-PDRsQueue",
      "messagesInFlight": "0"
    },
    {
      "messagesAvailable": "0",
      "name": "cumulus-api-lpdaac-dev-GranulesQueue",
      "messagesInFlight": "0"
    },
    {
      "messagesAvailable": "0",
      "name": "cumulus-api-lpdaac-dev-ProcessingQueue",
      "messagesInFlight": "0"
    },
    {
      "messagesAvailable": "683",
      "name": "cumulus-api-lpdaac-dev-DispatcherFailedQueue",
      "messagesInFlight": "0"
    }
  ],
  "services": [
    {
      "pendingCount": 0,
      "desiredCount": 1,
      "name": "cumulus-api-lpdaac-dev-discoverPdrsECSService-6YW4ICJMNAT1",
      "runningCount": 1,
      "status": "ACTIVE"
    },
    {
      "pendingCount": 0,
      "desiredCount": 1,
      "name": "cumulus-api-lpdaac-dev-ecsrunnerECSService-UNZYDBT4VQG",
      "runningCount": 1,
      "status": "ACTIVE"
    },
    {
      "pendingCount": 0,
      "desiredCount": 4,
      "name": "cumulus-api-lpdaac-dev-ingestGranulesECSService-14DH5QS8SBT1C",
      "runningCount": 4,
      "status": "ACTIVE"
    },
    {
      "pendingCount": 0,
      "desiredCount": 1,
      "name": "cumulus-api-lpdaac-dev-parsePdrsECSService-13TX7LIJHUUWG",
      "runningCount": 1,
      "status": "ACTIVE"
    },
    {
      "pendingCount": 0,
      "desiredCount": 1,
      "name": "cumulus-api-lpdaac-dev-jobsECSService-Z6ZGBLE2C83T",
      "runningCount": 1,
      "status": "ACTIVE"
    }
  ],
  "tasks": {
    "pendingTasks": 0,
    "runningTasks": 8
  },
  "updatedAt": 1492021453508,
  "timestamp": "2017-04-12T18:24:11.735Z"
}
```
