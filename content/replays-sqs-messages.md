## SQS Messages Replays
Cumulus archives all incoming SQS messages to S3 and removes messages once they have been processed. Unprocessed messages are archived at the path: `${stackName}/archived-incoming-messages/${queueName}/${messageId}`.

The Cumulus API supports requests to replay archived SQS messages by queue name.
The schema below describes the expected fields in a replay request

| Field | Type | Description |
| ------ | ------ | ------ |
| `queueName` | string | Any valid SQS queue name (*not* ARN) | |

#### Example Request

```curl
$ curl -X POST https://example.com/replays/sqs --header 'Authorization: Bearer ReplaceWithTheToken' --data '{ "queueName": "my-queue" }'
```

#### Example Response

```json
{
  "asyncOperationId": "208a463a-e096-4dd9-b006-e09345319ae6"
}
```
