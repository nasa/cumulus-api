## Recover cumulus messages

Endpoint provides a mechanism for recovery of S3 sfEventSqsToDbRecords dead letter objects (created as described in the [Core Documentation](https://nasa.github.io/cumulus/docs/features/dead_letter_archive)). The endpoint will invoke an async operation that will attempt to process all of the objects in the specified location.

The endpoint by default will process all records contained in the S3 objects from the default storage location on the S3 system bucket under the prefix of `<stackName>/dead-letter-archive/sqs/`. However, it is likely useful to process a subset of those objects, which you can do by moving the desired subset of objects to a new path on S3 and then specifying that new path using the `path` parameter to the endpoint request.

The query uses the following optional parameters:

| parameter | description |
| --- | --- |
| bucket | The bucket to read records from. Defaults to the Core system bucket|
| path | The S3 prefix (path) to read DLQ records from. Defaults to `<stackName>/dead-letter-archive/sqs/`|

```endpoint
POST /deadLetterArchive/recoverCumulusMessages
```

#### Example request

```curl
curl -X POST https://cumulus.podaac.sit.earthdata.nasa.gov/deadLetterArchive/recoverCumulusMessages --header "Authorization: Bearer $TOKEN" --header 'Content-Type: application/json' --data '{
    "bucket": "some-cumulus-bucket",
    "path": "some/path/to/records/"
}'
```

#### Example response

```json
{
    "createdAt":1646861517957,
    "updatedAt":1646861517957,
    "id":"a0cd2cf0-a677-e82a-27d1-0a09271aa37d",
    "status":"RUNNING",
    "taskArn":"arn:aws:ecs:us-west-2:xxxxxxxxxx:task/stack-CumulusECSCluster/{SHA}",
    "description":"Dead-Letter Processor ECS Run",
    "operationType":"Dead-Letter Processing" 
}
```
