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
            "name": "ModisInternalReport",
            "location": "s3://lpdaac-internal/lpdaac-cumulus/reconciliation-reports/ModisInternalReport.json",
            "type": "Internal",
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

##### Inventory Report

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

##### Internal Report

```json
{
  "reportType": "Internal",
  "createStartTime": "2020-08-28T19:01:50.636Z",
  "createEndTime": "2020-08-28T19:02:08.211Z",
  "reportStartTime": "2020-01-28T18:21:31.119Z",
  "reportEndTime": "2020-08-28T18:21:31.119Z",
  "status": "SUCCESS",
  "collections": {
    "okCount": 10,
    "withConflicts": [
      {
        "es": {
          "createdAt": 1591902043153,
          "granuleId": "^.*$",
          "sampleFileName": "L2_HR_PIXC_product_0001-of-4154.h5",
          "dataType": "L2_HR_PIXC",
          "name": "L2_HR_PIXC",
          "files": [
            {
              "bucket": "private",
              "regex": ".*.h5$",
              "sampleFileName": "L2_HR_PIXC_product_0001-of-4154.h5"
            }
          ],
          "granuleIdExtraction": "^(.*)(\\.h5|\\.cmr)",
          "reportToEms": true,
          "version": "000",
          "duplicateHandling": "error",
          "updatedAt": 1591902043153,
          "timestamp": 1591902043840
        },
        "db": {
          "duplicateHandling": "error",
          "granuleIdExtraction": "^(.*)(\\.h5|\\.cmr)",
          "version": "000",
          "dataType": "L2_HR_PIXC",
          "files": [
            {
              "bucket": "private",
              "sampleFileName": "L2_HR_PIXC_product_0001-of-4154.h5",
              "regex": ".*.h5$"
            }
          ],
          "updatedAt": 1591902043153,
          "createdAt": 1591902043153,
          "reportToEms": false,
          "granuleId": "^.*$",
          "sampleFileName": "L2_HR_PIXC_product_0001-of-4154.h5",
          "name": "L2_HR_PIXC"
        }
      }
    ],
    "onlyInEs": [
      "MCD43A1___006",
      "MOD09GQ___006"
    ],
    "onlyInDb": [
      "MYD13QA___005"
    ]
  },
  "granules": {
    "okCount": 77,
    "withConflicts": [
      {
        "es": {
          "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:IngestAndPublishGranule:edb21d63-b62d-42e9-8879-f39d53314f16",
          "processingEndDateTime": "2020-05-18T19:49:04.769Z",
          "published": false,
          "error": {},
          "productVolume": 253949,
          "timeToPreprocess": 0,
          "duration": 1.005,
          "createdAt": 1589831343764,
          "granuleId": "MOD14A1.A4313371.RQSeyH.006.7795385650931",
          "processingStartDateTime": "2020-05-18T19:49:03.831Z",
          "provider": "s3_provider",
          "timeToArchive": 0,
          "files": [
            {
              "bucket": "cumulus-test-sandbox-internal",
              "fileName": "MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf",
              "size": 233840,
              "source": "s3://cumulus-test-sandbox-internal/test-data/files/MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf",
              "type": "data",
              "key": "test-data/files/MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf"
            },
            {
              "bucket": "cumulus-test-sandbox-internal",
              "fileName": "MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf.met",
              "size": 14297,
              "source": "s3://cumulus-test-sandbox-internal/test-data/files/MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf.met",
              "type": "metadata",
              "key": "test-data/files/MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf.met"
            },
            {
              "bucket": "cumulus-test-sandbox-internal",
              "fileName": "BROWSE.MOD14A1.A4313371.RQSeyH.006.7795385650931.1.jpg",
              "size": 5812,
              "source": "s3://cumulus-test-sandbox-internal/test-data/files/BROWSE.MOD14A1.A4313371.RQSeyH.006.7795385650931.1.jpg",
              "type": "browse",
              "key": "test-data/files/BROWSE.MOD14A1.A4313371.RQSeyH.006.7795385650931.1.jpg"
            }
          ],
          "collectionId": "MOD14A1___006",
          "status": "running",
          "timestamp": 1589831367756,
          "updatedAt": 1589831344769
        },
        "db": {
          "published": true,
          "endingDateTime": "2017-11-08T23:59:59Z",
          "status": "completed",
          "timestamp": 1589831361039,
          "createdAt": 1589831343764,
          "processingEndDateTime": "2020-05-18T19:49:20.023Z",
          "productVolume": 258297,
          "timeToPreprocess": 0.263,
          "timeToArchive": 0.942,
          "productionDateTime": "2018-07-19T12:01:01Z",
          "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:123456789012:execution:IngestAndPublishGranule:edb21d63-b62d-42e9-8879-f39d53314f16",
          "files": [
            {
              "bucket": "cumulus-test-sandbox-protected",
              "key": "MOD14A1___006/2017/MOD/MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf",
              "size": 233840,
              "fileName": "MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf",
              "source": "s3://cumulus-test-sandbox-internal/test-data/files/MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf",
              "type": "data"
            },
            {
              "bucket": "cumulus-test-sandbox-private",
              "key": "MOD14A1___006/MOD/MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf.met",
              "size": 14297,
              "fileName": "MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf.met",
              "source": "s3://cumulus-test-sandbox-internal/test-data/files/MOD14A1.A4313371.RQSeyH.006.7795385650931.hdf.met",
              "type": "metadata"
            },
            {
              "bucket": "cumulus-test-sandbox-public",
              "key": "MOD14A1___006/BRO/BROWSE.MOD14A1.A4313371.RQSeyH.006.7795385650931.1.jpg",
              "size": 5812,
              "fileName": "BROWSE.MOD14A1.A4313371.RQSeyH.006.7795385650931.1.jpg",
              "source": "s3://cumulus-test-sandbox-internal/test-data/files/BROWSE.MOD14A1.A4313371.RQSeyH.006.7795385650931.1.jpg",
              "type": "browse"
            },
            {
              "bucket": "cumulus-test-sandbox-protected-2",
              "key": "MOD14A1___006/MOD/MOD14A1.A4313371.RQSeyH.006.7795385650931.cmr.xml",
              "size": 4348,
              "fileName": "MOD14A1.A4313371.RQSeyH.006.7795385650931.cmr.xml",
              "type": "metadata"
            }
          ],
          "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1234771093-CUMULUS",
          "processingStartDateTime": "2020-05-18T19:49:03.831Z",
          "updatedAt": 1589831361039,
          "beginningDateTime": "2017-10-24T00:00:00Z",
          "provider": "s3_provider",
          "granuleId": "MOD14A1.A4313371.RQSeyH.006.7795385650931",
          "collectionId": "MOD14A1___006",
          "duration": 17.275,
          "error": {
            "Error": "Unknown Error",
            "Cause": "None"
          },
          "lastUpdateDateTime": "2018-04-25T21:45:45.524053"
        }
      }
    ],
    "onlyInEs": [
      {
        "granuleId": "MYD13Q1.A0323210.Yujnv6.006.1973526114346",
        "collectionId": "MYD13Q1___006",
        "provider": "s3_provider",
        "createdAt": 1589913461833,
        "updatedAt": 1589913522990
      }
    ],
    "onlyInDb": [
      {
        "granuleId": "MYD13Q1.A5822875.qHI8hK.006.8698738069249",
        "collectionId": "MYD13Q1___006",
        "provider": "s3_provider",
        "createdAt": 1598552797312,
        "updatedAt": 1598552827611
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

| parameter | value | required | description |
| ----- | --- | -- | ----------- |
| `reportName` | `string` | `false` | Report name. |
| `reportType` | `"Inventory"`&vert;`"Internal"` | `false` | Report type (default Inventory) |
| `startTimestamp` | `string` | `false` | Any input valid for a JS Date contstructor. Data older than this will be ignored in the generated report.  |
| `endTimestamp` | `string` | `false` | Any input valid for a JS Date contstructor. Data newer than this will be ignored in the generated report.  |
| `collectionId` | `string` | `false` | collectionId for comparison of collection and granule holdings |
| `provider` | `string` | `false` | provider name for comparison of granule holdings |
| `granuleId` | `string` | `false` | granuleId for comparison of granule holdings |

*NOTE*: Adding a startTimestamp or endTimestamp value to the POST request will result in one way comparisons for some fields.

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
