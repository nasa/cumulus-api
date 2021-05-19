## Migration Counts

This endpoint triggers a run of the postgres-migration-count-tool as an async operation of type `Migration Count Report`.

For more information on the tool, see the [README](https://github.com/nasa/cumulus/blob/master/lambdas/postgres-migration-count-tool/README.md)

The query uses the following optional parameters:

| parameter | description |
| --- | --- |
| cutoffSeconds | Sets the number of seconds prior to this execution to 'cutoff' reconciliation queries.  This allows in-progress or other in-flight operations time to complete and propagate to ElasticSearch/Dynamo/Postgres.  Default is 3600|
| dbConcurrency | Sets max number of parallel collections reports  the script will run at a time.  Default 20 |
| dbMaxPool | Sets the maximum number of connections the database pool has available.   Modifying this may result in unexpected failures.    Default is 20 |
| reportPath | Sets the path location for the tool to write a copy of the lambda payload to S3 |
| reportBucket | Sets the bucket used for reporting.  If this argument is used, a `reportPath` must be set to generate a report |

```endpoint
POST /migrationCounts
```

#### Example request

```curl
$curl -X POST https://$API_URL/dev/migrationCounts -d 'reportBucket=someBucket&reportPath=someReportPath&cutoffSeconds=60&dbConcurrency=20&dbMaxPool=20' --header 'Authorization: Bearer $TOKEN'
```

#### Example response

```json
{"id":"7ccaed31-756b-40bb-855d-e5e6d00dc4b3","status":"RUNNING","taskArn":"arn:aws:ecs:us-east-1:AWSID:task/$PREFIX-CumulusECSCluster/123456789","description":"Migration Count Tool ECS Run","operationType":"Migration Count Report"}
```
