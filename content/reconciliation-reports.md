## List reconciliation reports

List reconciliation reports in the Cumulus system.

```endpoint
GET /reconciliationReports
```

#### Example request

```curl
$ curl https://example.com/reconciliationReports --header 'Authorization: Bearer ReplaceWithTheToken'
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
        "report-2019-03-05T15:34:30.508Z.json"
    ]
}
```

## Retrieve reconciliation report

Retrieve a single reconciliation report.

```endpoint
GET /reconciliationReports/{name}
```

#### Example request

```curl
$ curl https://example.com/reconciliationReports/report-2019-03-05T15:34:30.508Z.json --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "reportStartTime": "2019-03-05T15:34:30.508Z",
    "reportEndTime": "2019-03-05T15:34:37.243Z",
    "status": "SUCCESS",
    "error": null,
    "filesInCumulus": {
        "okCount": 40,
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
    },
    "collectionsInCumulusCmr": {
        "okCount": 1,
        "onlyInCumulus": [
            "L2_HR_PIXC___000"
        ],
        "onlyInCmr": [
            "MCD43A1___006",
            "MOD14A1___006"
        ]
    },
    "granulesInCumulusCmr": {
        "okCount": 3,
        "onlyInCumulus": [
            {
                "granuleId": "MOD09GQ.A3518809.ln_rVr.006.7962927138074",
                "collectionId": "MOD09GQ___006"
            },
            {
                "granuleId": "MOD09GQ.A8768252.HC4ddD.006.2077696236118",
                "collectionId": "MOD09GQ___006"
            }
        ],
        "onlyInCmr": [
            {
                "GranuleUR": "MOD09GQ.A0002421.oD4zvB.006.4281362831355",
                "ShortName": "MOD09GQ",
                "Version": "006"
            },
            {
                "GranuleUR": "MOD09GQ.A0007443.H16AHq.006.7078190437865",
                "ShortName": "MOD09GQ",
                "Version": "006"
            }
        ]
    },
    "filesInCumulusCmr": {
        "okCount": 11,
        "onlyInCumulus": [
            {
                "fileName": "MOD09GQ.A8722843.GTk5A3.006.4026909316904.jpeg",
                "uri": "s3://cumulus-test-sandbox-public/MOD09GQ___006/MOD/MOD09GQ.A8722843.GTk5A3.006.4026909316904.jpeg",
                "granuleId": "MOD09GQ.A8722843.GTk5A3.006.4026909316904"
            }
        ],
        "onlyInCmr": [
            {
                "URL": "https://example.com/MYD13Q1.A2017297.h19v10.006.2017313221202.hdf",
                "Type": "GET DATA",
                "GranuleUR": "MOD09GQ.A4675287.SWPE5_.006.7310007729190"
            },
            {
                "URL": "https://cumulus-test-sandbox-public.s3.amazonaws.com/MOD09GQ___006/MOD/MOD09GQ.A8722843.GTk5A3.006.4026909316904_ndvi.jpg",
                "Type": "GET DATA",
                "GranuleUR": "MOD09GQ.A8722843.GTk5A3.006.4026909316904"
            }
        ]
    }
}
```

## Create reconciliation report

Create a new reconciliation report.

```endpoint
POST /reconciliationReports
```

#### Example request

```curl
$ curl --request POST https://example.com/reconciliationReports --header 'Authorization: Bearer ReplaceWithToken'
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
DELETE /reconciliationReports/{name}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/reconciliationReports/report-2018-06-20T20:58:38.883Z.json --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "message": "Report deleted"
}
```
