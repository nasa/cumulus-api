## Distribution Metrics

The Cumulus API provides information about recent distribution API performance.

`GET` requests to the `distributionMetrics` endpoint return a json object with the `distributionApi`'s previous 24 hour total number of errors and successes.

Total errors are computed based on the sum of server errors (5XX Errors), user errors (4XX Errors) from the `distributionApi`, as well as any s3 server log metrics that have been published to cloudwatch's custom metric service with parameters:

```
Metric Name: FailureCount,
Custom Namespace: CumulusDistribution
Dimension: Stack  // with Value: prefix
```

Total successes are computed strictly from the cloudwatch custom metric service with following parameters:

```
Metric Name: SuccessCount,
Custom Namespace: CumulusDistribution,
Dimension: Stack // with Value: prefix
```


The standard and suggested way to publish custom metrics is use the [`@cumulus/s3-access-metrics`](https://github.com/nasa/cumulus/tree/master/packages/s3-access-metrics) package.  It is a independently deployed stack that you must configure to read the server access logs for your cumulus instance.



```endpoint
GET /distributionMetrics
```

#### Example Request
```curl
$ curl https://example.com/distributionMetrics --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example Response
```json
{
  "errors": "5",
  "successes": "2330"
}
```
