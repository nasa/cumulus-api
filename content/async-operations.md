## Async Operations

Async Operations are long-running requests serviced by the Cumulus API.

These tend to be bulk operations.
Examples include bulk granule operations and replaying ingest notifications.

The `asyncOperations` endpoint supports fetching the status of an operation

```endpoint
GET /asyncOperations/{asyncOperationId}
```

#### Example Request

```curl
$ curl https://example.com/asyncOperations/208a463a-e096-4dd9-b006-e09345319ae6 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example Response

```json
{
  "id": "208a463a-e096-4dd9-b006-e09345319ae6",
  "status": "RUNNING",
  "taskArn": "arn:aws:ecs:us-east-1:111111111111:task/d481e76e-f5fc-9c1c-2411-fa13779b111a"
}
```
