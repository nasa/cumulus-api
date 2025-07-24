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
        "table": "reconciliation_reports",
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
            "name": "ModisInventoryReport",
            "location": "s3://lpdaac-internal/lpdaac-cumulus/reconciliation-reports/ModisInventoryReport.json",
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

#### Example responses

```json
{
  "presignedS3Url": "https://example.amazonaws.com/example",
  "data": "report data, see examples below for each report type"
}
```

```json
{
  "presignedS3Url": "https://example.amazonaws.com/example",
  "data": "Error: Report examplereport exceeded maximum allowed payload size"
}
```

##### Inventory Report

```json
{
    "reportStartTime": "2019-03-05T15:34:30.508Z",
    "reportEndTime": "2019-03-05T15:34:37.243Z",
    "status": "SUCCESS",
    "error": null,
    "reportType": "Inventory",
    "filesInCumulus": {
        "okCount": 40,
        "okCountByGranule": {
          "MOD09GQ.A2016358.h13v04.006.2016360104606": 10,
          "MYD13Q1.A2017297.h19v10.006.2017313221303": 10,
          "MOD09GQ.A3518809.ln_rVr.006.7962927138074": 10,
          "MOD09GQ.A8768252.HC4ddD.006.2077696236118": 5,
          "MOD09GQ.A8722843.GTk5A3.006.4026909316904": 5
        },
        "onlyInS3": [
            "s3://cumulus-test-sandbox-protected/MOD09GQ.A2016358.h13v04.006.2016360104606.cmr.xml",
            "s3://cumulus-test-sandbox-private/BROWSE.MYD13Q1.A2017297.h19v10.006.2017313221201.hdf"
        ],
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

##### Granule Not Found Report

```json
{
  "createStartTime": "2020-08-28T18:33:50.525Z",
  "createEndTime": "2020-08-28T18:34:16.646Z",
  "status": "SUCCESS",
  "reportType": "Granule Not Found",
  "filesInCumulus": {
    "okCount": 20,
    "okCountByGranule": {
      "MOD09GQ.A2770300.W1_V5Z.006.7853319756315": 2,
      "MOD09GQ.A7682091.QtZjhI.006.1218763030745": 3,
      "MOD09GQ.A9536857.bV1q4A.006.0980635705136": 3,
      "MOD09GQ.A7790080.xLPpTZ.006.2292724247258": 3,
      "MOD09GQ.A3769578.tlqq7j.006.4434181201872": 3,
      "MOD09GQ.A5423294.RFOrMI.006.8677601711674": 3,
      "MOD09GQ.A8837603.fb2Vhw.006.3950746589733": 3
    },
    "onlyInS3": [
      "s3://cumulus-sandbox-private/MOD09GQ___006/MOD/test-data-1593122280799/MOD09GQ.A6921412.znLBqe.006.9673856807617.hdf.met",
      "s3://cumulus-sandbox-private/MOD09GQ___006/MOD/test-data-1593122597517/MOD09GQ.A1201557.d6tP2Y.006.7482431709753.hdf.met",
      "s3://cumulus-sandbox-private/MOD09GQ___006/MOD/test-data-1593198955197/MOD09GQ.A7375038.gm1irM.006.1317280710645.hdf.met",
      "s3://cumulus-sandbox-protected/MOD09GQ___006/2017/MOD/test-data-1593122280799/MOD09GQ.A6921412.znLBqe.006.9673856807617.hdf",
      "s3://cumulus-sandbox-protected/MOD09GQ___006/2017/MOD/test-data-1593122597517/MOD09GQ.A1201557.d6tP2Y.006.7482431709753.hdf",
      "s3://cumulus-sandbox-protected/MOD09GQ___006/2017/MOD/test-data-1593122881446/MOD09GQ.A2708681.CFkGhW.006.7154000014360.hdf"
    ],
  },
  "collectionsInCumulusCmr": {
    "okCount": 0,
    "onlyInCumulus": [
      "MOD09GQ_test-test-data-1593122280799___006",
      "MOD09GQ_test-test-data-1593122597517___006",
      "MOD09GQ_test-test-data-1593122881446___006",
      "MOD09GQ_test-test-data-1593178175944___006",
      "MOD09GQ_test-test-data-1593198739991___006",
      "MOD09GQ_test-test-data-1593198955197___006",
      "MOD09GQ_test-test-data-1593199179316___006",
      "MOD09GQ_test-test-data-1593199379860___006",
      "MOD09GQ_test-test-data-1593199548454___006",
      "MOD09GQ_test-test-data-1593199742089___006",
      "MOD09GQ_test-test-data-1593199934835___006"
    ],
    "onlyInCmr": [
      "A2_RainOcn_NRT___0",
      "A2_SI12_NRT___0",
      "A2_SI25_NRT___0",
      "A2_SI6_NRT___0",
      "AST_L1A___003",
      "CMR44JK___001",
      "L2_HR_PIXC___000",
      "L2_HR_PIXC___1",
      "MCD43A1___006",
      "MOD09GQ___006",
      "MOD11A1___006",
      "MOD14A1___006",
      "MUR-JPL-L4-GLOB-v4.1___1",
      "MYD09A1___006",
      "MYD13A1___006",
      "MYD13Q1___006",
      "hs3avaps___1",
      "hs3wwlln___1"
    ]
  },
  "granulesInCumulusCmr": {
    "okCount": 0,
    "onlyInCumulus": [],
    "onlyInCmr": []
  },
  "filesInCumulusCmr": {
    "okCount": 0,
    "onlyInCumulus": [],
    "onlyInCmr": []
  }
}
```

##### ORCA Backup Report

```json
{
  "collectionIds": [
    "MYD13Q1___006",
    "MOD09GQ___006"
  ],
  "createEndTime": "2022-02-11T19:13:41.986Z",
  "createStartTime": "2022-02-11T19:13:41.153Z",
  "granuleIds": [
    "MYD13Q1.A3194547.tnYsne.006.8400707913298",
    "MYD13Q1.A2655880.GOWVT9.006.3531712476486",
    "MOD09GQ.A8858216.Y6HJnu.006.6168319936421"
  ],
  "providers": [
    "modas_provider",
    "s3_provider"
  ],
  "reportEndTime": "2022-02-11T19:12:25.000Z",
  "reportType": "ORCA Backup",
  "status": "SUCCESS",
  "granules": {
    "okCount": 0,
    "cumulusCount": 2,
    "orcaCount": 2,
    "okFilesCount": 5,
    "conflictFilesCount": 6,
    "withConflicts": [
      {
        "okFilesCount": 4,
        "granuleId": "MYD13Q1.A3194547.tnYsne.006.8400707913298",
        "collectionId": "MYD13Q1___006",
        "provider": "s3_provider",
        "createdAt": 1644606673827,
        "updatedAt": 1644606718024,
        "conflictFiles": [
          {
            "fileName": "MYD13Q1.A3194547.tnYsne.006.8400707913298.cmr.xml",
            "bucket": "cumulus-test-sandbox-protected-2",
            "key": "MYD13Q1___006/MYD/MYD13Q1.A3194547.tnYsne.006.8400707913298.cmr.xml",
            "reason": "shouldBeExcludedFromOrca"
          },
          {
            "fileName": "BROWSE.MYD13Q1.A3194547.tnYsne.006.8400707913298.1.jpg2",
            "bucket": "cumulus-test-sandbox-public",
            "key": "MYD13Q1___006/BRO/BROWSE.MYD13Q1.A3194547.tnYsne.006.8400707913298.1.jpg2",
            "reason": "onlyInCumulus"
          },
          {
            "fileName": "BROWSE.MYD13Q1.A3194547.tnYsne.006.8400707913298.1.jpg",
            "bucket": "cumulus-test-sandbox-public",
            "key": "MYD13Q1___006/BRO/BROWSE.MYD13Q1.A3194547.tnYsne.006.8400707913298.1.jpg",
            "orcaBucket": "cumulus-test-sandbox-orca-glacier",
            "reason": "onlyInOrca"
          }
        ]
      }
    ],
    "onlyInCumulus": [
      {
        "okFilesCount": 1,
        "granuleId": "MYD13Q1.A2655880.GOWVT9.006.3531712476486",
        "collectionId": "MYD13Q1___006",
        "provider": "s3_provider",
        "createdAt": 1644606673656,
        "updatedAt": 1644606683360,
        "conflictFiles": [
          {
            "fileName": "MYD13Q1.A2655880.GOWVT9.006.3531712476486.hdf",
            "bucket": "cumulus-test-sandbox-protected",
            "key": "MYD13Q1___006/2017/MYD/MYD13Q1.A2655880.GOWVT9.006.3531712476486.hdf",
            "reason": "onlyInCumulus"
          },
          {
            "fileName": "BROWSE.MYD13Q1.A2655880.GOWVT9.006.3531712476486.hdf",
            "bucket": "cumulus-test-sandbox-private",
            "key": "MYD13Q1___006/BRO/BROWSE.MYD13Q1.A2655880.GOWVT9.006.3531712476486.hdf",
            "reason": "onlyInCumulus"
          },
          {
            "fileName": "BROWSE.MYD13Q1.A2655880.GOWVT9.006.3531712476486.1.jpg",
            "bucket": "cumulus-test-sandbox-public",
            "key": "MYD13Q1___006/BRO/BROWSE.MYD13Q1.A2655880.GOWVT9.006.3531712476486.1.jpg",
            "reason": "onlyInCumulus"
          },
          {
            "fileName": "MYD13Q1.A2655880.GOWVT9.006.3531712476486.cmr.xml",
            "bucket": "cumulus-test-sandbox-protected-2",
            "key": "MYD13Q1___006/MYD/MYD13Q1.A2655880.GOWVT9.006.3531712476486.cmr.xml",
            "reason": "onlyInCumulus"
          }
        ]
      }
    ],
    "onlyInOrca": [
      {
        "granuleId": "MOD09GQ.A8858216.Y6HJnu.006.6168319936421",
        "provider": "s3_provider",
        "collectionId": "MOD09GQ___006",
        "createdAt": 1643920768281,
        "conflictFiles": [
          {
            "bucket": "cumulus-test-sandbox-protected",
            "key": "MOD09GQ___006/2017/MOD/MOD09GQ.A8858216.Y6HJnu.006.6168319936421.hdf",
            "fileName": "MOD09GQ.A8858216.Y6HJnu.006.6168319936421.hdf",
            "orcaBucket": "cumulus-test-sandbox-orca-glacier",
            "reason": "onlyInOrca"
          },
          {
            "bucket": "cumulus-test-sandbox-public",
            "key": "MOD09GQ___006/MOD/MOD09GQ.A8858216.Y6HJnu.006.6168319936421_ndvi.jpg",
            "fileName": "MOD09GQ.A8858216.Y6HJnu.006.6168319936421_ndvi.jpg",
            "orcaBucket": "cumulus-test-sandbox-orca-glacier",
            "reason": "onlyInOrca"
          },
          {
            "bucket": "cumulus-test-sandbox-protected-2",
            "key": "MOD09GQ___006/MOD/MOD09GQ.A8858216.Y6HJnu.006.6168319936421.cmr.xml",
            "fileName": "MOD09GQ.A8858216.Y6HJnu.006.6168319936421.cmr.xml",
            "orcaBucket": "cumulus-test-sandbox-orca-glacier",
            "reason": "onlyInOrca"
          }
        ]
      }
    ]
  }
}
````

##### Granule Inventory Report

``` json
"granuleUr","collectionId","createdAt","startDateTime","endDateTime","status","updatedAt","published"
"MOD14A1.A9506271.IvEJsu.006.8359924290786","MOD14A1___006","2020-05-18T20:15:54.525Z","2017-10-24T00:00:00Z","2017-11-08T23:59:59Z","completed","2020-05-18T20:16:02.473Z",false
"MYD13Q1.A9663671.0zkwKH.006.9812354158395","MYD13Q1___006","2020-07-06T19:46:19.957Z","2017-10-24T00:00:00Z","2017-11-08T23:59:59Z","completed","2020-07-06T19:46:57.054Z",true
```

## Create reconciliation report

Create a new reconciliation report.

```endpoint
POST /reconciliationReports
```
### Request body

| parameter | value | required | description |
| ----- | --- | -- | ----------- |
| `reportName` | `string` | `false` | Report name. |
| `reportType` | `"Granule Inventory"`&vert;`"Granule Not Found"`&vert;`"Internal"`&vert;`"Inventory"`&vert;`"ORCA Backup"` | `false` | Report type (default Inventory) |
| `startTimestamp` | `string` | `false` | Any input valid for a JS Date contstructor. Data older than this will be ignored in the generated report.  |
| `endTimestamp` | `string` | `false` | Any input valid for a JS Date contstructor. Data newer than this will be ignored in the generated report.|
| `collectionId` | [`string | array`] | `false` | collectionId (or array of collectionIds) for comparison of collection and granule holdings. |
| `granuleId` | [`string | array`] | `false` | granuleId (or array of granuleIds) for use for comparison of collection and granule holdings. |
| `provider` | [`string | array`] | `false` | provider name (or array of providers) for comparison of granule holdings |
| `status` | `string` | `false` | status filter for Granule Inventory reports |

*NOTE*: Adding a startTimestamp or endTimestamp value to the POST request will result in one way comparisons for some fields for `Inventory` and `Granule Not Found` reports.

*NOTE*: Adding a granuleId input will result in an one way report for collections for `Inventory` and `Granule Not Found` reports.

*NOTE*: `Inventory` and `Granule Not Found` reports only allow one of the parameters (`collectionId`, `granuleId`, `provider`) in same request.

*NOTE*: `Granule Inventory` reports can be filtered with the following parameters: (`collectionId`, `granuleId`, `status`). If `granuleId` is a string or single value array, it will search for granules with granuleIds containing that substring.

#### Example request

```curl
$ curl --request POST https://example.com/reconciliationReports --header 'Authorization: Bearer ReplaceWithToken' --header 'Content-Type: application/json' --data '{
  "reportName": "ModisInventoryReport",
  "reportType": "Inventory",
  "startTimestamp": 1269993600000,
  "endTimestamp": 1350000000000,
  "collectionId": "MOD09GQ___006",
  "provider": "MODIS",
  "granuleId": "MOD09GQ.A2016358.h13v04.006.2016360104606"
}'
```

#### Example response

```json
{
  "id": "bb7059f4-0cd8-4205-8857-fb0e6b68b3e4"
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
