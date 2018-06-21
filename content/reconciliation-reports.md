## List reconciliation reports

List reconciliation reports in the Cumulus system.

```endpoint
GET /v1/reconciliationReports
```

#### Example request

```curl
$ curl https://example.com/v1/reconciliationReports --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus"
    },
    "results": [
        "report-2018-04-20T20:58:38.883Z.json",
        "report-2018-05-20T20:58:38.883Z.json",
        "report-2018-06-20T20:58:38.883Z.json"
    ]
}
```

## Retrieve reconciliation reports

Retrieve a single reconciliation report.

```endpoint
GET /v1/reconciliationReports/{name}
```

#### Example request

```curl
$ curl https://example.com/v1/reconciliationReports/report-2018-06-20T20:58:38.883Z.json --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "reportStartTime": "2018-06-20T20:58:38.883Z",
    "reportEndTime": "2018-06-20T20:58:40.943Z",
    "status": "SUCCESS",
    "error": null,
    "okFileCount": 0,
    "onlyInS3": [
        "s3://cumulus-test-sandbox-protected/MOD09GQ.A2016358.h13v04.006.2016360104606.cmr.xml",
        "s3://cumulus-test-sandbox-private/BROWSE.MYD13Q1.A2017297.h19v10.006.2017313221201.hdf"
    ],
    "onlyInDynamoDb": [
            {
              "uri": "s3://cumulus-test-sandbox-protected/MOD09GQ.A2016358.h13v04.006.2016360104606.hdf",
              "granuleId": "MOD09GQ.A2016358.h13v04.006.2016360104606"
            },
            {
              "uri": "s3://cumulus-test-sandbox-private/MYD13Q1.A2017297.h19v10.006.2017313221303.hdf.met",
              "granuleId": "MYD13Q1.A2017297.h19v10.006.2017313221303"
            }
    ]
}
```

## Create reconciliation report

Create a new reconciliation report.

```endpoint
POST /v1/reconciliationReports
```

#### Example request

```curl
$ curl --request POST https://example.com/v1/reconciliationReports --header 'Authorization: Bearer ReplaceWithToken'
```

#### Example response

```json
{
    "message": "Report is being generated",
    "status": 202
}
```

## Delete reconciliation report

Delete a reconciliation report from Cumulus.

```endpoint
DELETE /v1/reconciliationReports/{name}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/v1/reconciliationReports/report-2018-06-20T20:58:38.883Z.json --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "message": "Report deleted"
}
```
