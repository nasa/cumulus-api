## List granules

List granules in the Cumulus system.

```endpoint
GET /v1/granules
```

#### Example request

```curl
$ curl https://example.com/v1/granules --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "granule",
        "limit": 1,
        "page": 1,
        "count": 8
    },
    "results": [
        {
            "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
            "pdrName": "7970bff5-128a-489f-b43c-de4ad7834ce5.PDR",
            "collectionId": "MOD11A1___006",
            "status": "completed",
            "provider": "LP_TS2_DataPool",
            "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:433612427488:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:7f071dae1a93c9892272b7fd5",
            "files": [
                {
                    "bucket": "cumulus-devseed-protected",
                    "path": "/TEST_B/Cumulus/MODIS/DATA",
                    "checksumValue": 964704694,
                    "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "fileSize": 1447347,
                    "checksumType": "CKSUM",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "url_path": ""
                },
                {
                    "bucket": "cumulus-devseed-private",
                    "path": "/TEST_B/Cumulus/MODIS/DATA",
                    "checksumValue": 121318124,
                    "filename": "s3://cumulus-devseed-private/MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
                    "fileSize": 22559,
                    "checksumType": "CKSUM",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
                    "url_path": ""
                },
                {
                    "bucket": "cumulus-devseed-private",
                    "path": "/TEST_B/Cumulus/MODIS/DATA",
                    "checksumValue": 2188150664,
                    "filename": "s3://cumulus-devseed-private/BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "fileSize": 18118,
                    "checksumType": "CKSUM",
                    "name": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "url_path": ""
                },
                {
                    "bucket": "cumulus-devseed-protected",
                    "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
                },
                {
                    "bucket": "cumulus-devseed-public",
                    "filename": "s3://cumulus-devseed-public/MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg"
                },
                {
                    "bucket": "cumulus-devseed-protected",
                    "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
                    "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml"
                },
                {
                    "bucket": "cumulus-devseed-public",
                    "filename": "s3://cumulus-devseed-public/MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg",
                    "name": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg"
                }
            ],
            "error": null,
            "createdAt": 1513020455831,
            "timestamp": 1513020462156,
            "published": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS",
            "duration": 6.325,
            "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS"
        }
    ]
}
```

## Retrieve granule

Retrieve a single granule.

```endpoint
GET /v1/granules/{granuleId}
```

#### Example request

```curl
$ curl https://example.com/v1/granules/MOD11A1.A2017137.h20v17.006.2017138085755 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
    "pdrName": "7970bff5-128a-489f-b43c-de4ad7834ce5.PDR",
    "collectionId": "MOD11A1___006",
    "status": "completed",
    "provider": "LP_TS2_DataPool",
    "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:433612427488:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:7f071dae1a93c9892272b7fd5",
    "files": [
        {
            "bucket": "cumulus-devseed-protected",
            "path": "/TEST_B/Cumulus/MODIS/DATA",
            "checksumValue": 964704694,
            "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "fileSize": 1447347,
            "checksumType": "CKSUM",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "url_path": ""
        },
        {
            "bucket": "cumulus-devseed-private",
            "path": "/TEST_B/Cumulus/MODIS/DATA",
            "checksumValue": 121318124,
            "filename": "s3://cumulus-devseed-private/MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
            "fileSize": 22559,
            "checksumType": "CKSUM",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf.met",
            "url_path": ""
        },
        {
            "bucket": "cumulus-devseed-private",
            "path": "/TEST_B/Cumulus/MODIS/DATA",
            "checksumValue": 2188150664,
            "filename": "s3://cumulus-devseed-private/BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "fileSize": 18118,
            "checksumType": "CKSUM",
            "name": "BROWSE.MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "url_path": ""
        },
        {
            "bucket": "cumulus-devseed-protected",
            "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.hdf",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755.hdf"
        },
        {
            "bucket": "cumulus-devseed-public",
            "filename": "s3://cumulus-devseed-public/MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755_2.jpg"
        },
        {
            "bucket": "cumulus-devseed-protected",
            "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
            "filename": "s3://cumulus-devseed-protected/MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755.cmr.xml"
        },
        {
            "bucket": "cumulus-devseed-public",
            "filename": "s3://cumulus-devseed-public/MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg",
            "name": "MOD11A1.A2017137.h20v17.006.2017138085755_1.jpg"
        }
    ],
    "error": null,
    "createdAt": 1513020455831,
    "timestamp": 1513020462156,
    "published": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS",
    "duration": 6.325,
    "cmrLink": "https://cmr.uat.earthdata.nasa.gov/search/granules.json?concept_id=G1220753758-CUMULUS",
    "_id": "MOD11A1.A2017137.h20v17.006.2017138085755"
}
```

## Reingest granule

Reingest a granule. This causes the granule to re-download to Cumulus from source, and begin processing from scratch.

```endpoint
PUT /v1/granules/{granuleId}
```

#### Example request

```curl
$ curl --request PUT https://example.com/v1/granules/MOD11A1.A2017137.h20v17.006.2017138085755 --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"action": "reingest"}'
```

#### Example response

```json
{
    "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
    "action": "reingest",
    "status": "SUCCESS"
}
```

## Apply workflow to granule

Apply the named workflow to the granule. Optional parameters include selecting input or output from the previous execution and optional override objects to override `meta` and `payload` in the new execution input message.

```endpoint
PUT /v1/granules/{granuleid}
```

#### Example request

```curl
$ curl --request PUT https://example.com/v1/granules/MOD11A1.A2017137.h19v16.006.2017138085750 --header 'Authorization: Bearer ReplaceWithTheToken' --data '{ "action": "applyWorkflow", "workflow": "inPlaceWorkflow", "messageSource": "output", "metaOverride": { "updatedField": "updatedValue" }, "payloadOverride": { "updatedField": "updatedValue" } }'
```

#### Example response

```json
{
    "granuleId": "MOD11A1.A2017137.h20v17.006.2017138085755",
    "action": "applyWorkflow inPlaceWorkflow",
    "status": "SUCCESS"
}
```

## Move a granule

Move a granule from one location on S3 to another. Individual files are moved to specific locations by using a regex that matches their filenames.

```endpoint
PUT /v1/granules/{granuleId}
```

#### Example request

```curl
$ curl --request PUT https://example.com/v1/granules/MOD11A1.A2017137.h19v16.006.2017138085750 --header 'Authorization: Bearer ReplaceWithTheToken' --data '{ "action": "move", "destinations": [{ "regex": ".*.hdf$", "bucket": "s3-bucket", "filepath": "new/filepath/" }]}'
```

#### Example response

```json
{
  "granuleId": "MOD11A1.A2017137.h19v16.006.2017138085750",
  "action": "move",
  "status": "SUCCESS"
}
```

## Remove granule from CMR

Remove a Cumulus granule from CMR.

```endpoint
PUT /v1/granules/{granuleId}
```

#### Example request

```curl
$ curl --request PUT https://example.com/v1/granules/MOD11A1.A2017137.h19v16.006.2017138085750 --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"action": "removeFromCmr"}'
```

#### Example response

```json
{
    "granuleId": "MOD11A1.A2017137.h19v16.006.2017138085750",
    "action": "removeFromCmr",
    "status": "SUCCESS"
}
```

## Delete granule

Delete a granule from Cumulus. It must _already_ be removed from CMR.

```endpoint
DELETE /v1/granules/{granuleId}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/v1/granules/1A0000-2016121001_002_001 --header 'Authorization: Bearer ReplaceWithTheToken'

```

#### Example response

```json
{
  "detail": "Record deleted"
}
```
