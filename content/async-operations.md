## List async operations

Async operations are long-running requests serviced by the Cumulus API.

These tend to be bulk operations. Examples include bulk granule operations and replaying ingest notifications.

This endpoint lists async operations in the Cumulus system.

```endpoint
GET /asyncOperations
```

#### Example request

```curl
$ curl https://example.com/asyncOperations --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "asyncOperation",
        "limit": 1,
        "page": 1,
        "count": 8
    },
    "results": [
        {
          "output": "{\"deletedGranules\":[\"granule-id-f02a53418f\"]}",
          "createdAt": 1591384094512,
          "taskArn": "arn:aws:ecs:us-east-1:111111111111:task/d481e76e-f5fc-9c1c-2411-fa13779b111a",
          "description": "Bulk granule deletion",
          "operationType": "Bulk Granule Delete",
          "id": "0eb8e809-8790-5409-1239-bcd9e8d28b8e",
          "status": "SUCCEEDED",
          "updatedAt": 1591384094512,
          "timestamp": 1591384095235
        }
    ]
}
```

## Retrieve async operation

Retrieve information about a single async operation. Useful for determining the status of an async operation.

```endpoint
GET /asyncOperations/{id}
```

#### Example request

```curl
$ curl https://example.com/asyncOperations/0eb8e809-8790-5409-1239-bcd9e8d28b8e --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "id": "0eb8e809-8790-5409-1239-bcd9e8d28b8e",
  "updatedAt": 1574730504762,
  "status": "RUNNING",
  "taskArn": "arn:aws:ecs:us-east-1:111111111111:task/d481e76e-f5fc-9c1c-2411-fa13779b111a",
  "description": "Bulk granule deletion",
  "operationType": "Bulk Granule Delete"
}
```
