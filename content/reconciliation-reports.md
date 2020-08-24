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
        "stack": "lpdaac-cumulus",
        "table": "reconciliationReport",
        "limit": 2,
        "page": 1,
        "count": 7
    },
    "results": [
        {
            "createdAt": 1589824212102,
            "name": "inventoryReport-20200518T175012101",
            "location": "s3://lpdaac-internal/lpdaac-cumulus/reconciliation-reports/inventoryReport-20200518T175012101.json",
            "type": "Inventory",
            "status": "Generated",
            "updatedAt": 1589824218825,
            "timestamp": 1589824219329
        },
        {
            "createdAt": 1589596344305,
            "name": "inventoryReport-20200516T023224305",
            "location": "s3://lpdaac-internal/lpdaac-cumulus/reconciliation-reports/inventoryReport-20200516T023224305.json",
            "type": "Inventory",
            "status": "Generated",
            "updatedAt": 1589596352010,
            "timestamp": 1589596352356
        }
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
$ curl https://example.com/reconciliationReports/inventoryReport-20190305T153430508 --header 'Authorization: Bearer ReplaceWithTheToken'
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
### Request body

| parameter | type | required | description |
| ----- | --- | -- | ----------- |
| `startTimestamp` | string | `false` | Any input valid for a JS Date contstructor. Data older than this will be ignored in the generated report.  |
| `endTimestamp` | string | `false` | Any input valid for a JS Date contstructor. Data newer than this will be ignored in the generated report.  |


*NOTE*: Adding a startTimestamp or endTimestamp value to the POST request will result in one way comparisons for some fields.

#### Example request

```curl
$ curl --request POST https://example.com/reconciliationReports --header 'Authorization: Bearer ReplaceWithToken' --header 'Content-Type: application/json' [--data '{
  "startTimestamp": 1269993600000
  "endTimestamp": 1350000000000
}']
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
$ curl --request DELETE https://example.com/reconciliationReports/inventoryReport-20180620T205838883 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "message": "Report deleted"
}
```
