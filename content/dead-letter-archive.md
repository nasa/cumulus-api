## Recover cumulus messages

Endpoint provides a mechanism for recovery of S3 sfEventSqsToDbRecords dead letter objects (created as described in the [Core Documentation](https://nasa.github.io/cumulus/docs/features/dead_letter_archive)).   The endpoint will invoke an async operation that will attempt to process all of the records in the specified location.

The endpoint by default will process all records from the default storage location on the S3 system bucket `<stackName>/dead-letter-archive/sqs/`, however it is likely useful to process a subset of those granules by moving the records to process to another prefix on S3

The query uses the following optional parameters:

| parameter | description |
| --- | --- |
| bucket | The bucket to read records from. Default the Core system bucket|
| path | The S3 prefix (path) to read DLQ records from.  Defaults to `<stackName>/dead-letter-archive/sqs/`|

```endpoint
POST /deadLetterARchive/recoverCumulusMessages
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