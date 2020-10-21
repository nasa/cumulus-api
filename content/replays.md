## Ingest Replays

The Cumulus API supports requests to replay ingest notifications.
The schema below describes the expected fields in a replay request

| Field | Type | Required | Description |
| ------ | ------ | ------ | ------ |
| `type` | string | required | Currently only accepts `kinesis`. |
| `kinesisStream` | string | for type `kinesis` | Any valid kinesis stream name (*not* ARN) |
| `kinesisStreamCreationTimestamp` | * | optional | Any input valid for a JS Date constructor. For reasons to use this field see [AWS documentation on StreamCreationTimestamp](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_ListShards.html#API_ListShards_RequestSyntax). |
| `endTimestamp` | * | optional | Any input valid for a JS Date constructor. Messages newer than this timestamp will be skipped.
| `startTimestamp` | * | optional | Any input valid for a JS Date constructor. Messages will be fetched from the Kinesis stream starting at this timestamp. Ignored if it is further in the past than the stream's retention period. |

#### Example Request

```curl
$ curl -X POST https://example.com/replays --header 'Authorization: Bearer ReplaceWithTheToken' --data '{ "type: "kinesis", "kinesisStream": "my-stream", "endTimestamp": 1567890123456, "startTimestamp": "2019-08-31T22:22:03.456Z"}'
```

#### Example Response

```json
{
  "asyncOperationId": "208a463a-e096-4dd9-b006-e09345319ae6"
}
```
