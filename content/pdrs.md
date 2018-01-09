## List PDRs

List PDRs in the Cumulus system.

```endpoint
GET /pdrs
```

#### Example request

```curl
$ curl https://example.com/pdrs --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "pdr",
        "limit": 1,
        "page": 1,
        "count": 8
    },
    "results": [
        {
            "pdrName": "7970bff5-128a-489f-b43c-de4ad7834ce5.PDR",
            "collectionId": "MOD11A1___006",
            "status": "failed",
            "provider": "LP_TS2_DataPool",
            "progress": 0,
            "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:433612427488:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:6ef0c52f83c549db58b3a1e50",
            "PANSent": false,
            "PANmessage": "N/A",
            "stats": {
                "processing": 0,
                "completed": 0,
                "failed": 0,
                "total": 0
            },
            "createdAt": 1514305411204,
            "timestamp": 1514305424036,
            "duration": 12.832
        }
    ]
}
```

## Retrieve PDR

Retrieve a single PDR.

```endpoint
GET /pdrs/{pdrName}
```

#### Example request

```curl
$ curl https://example.com/pdrs/7970bff5-128a-489f-b43c-de4ad7834ce5.PDR --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "pdrName": "7970bff5-128a-489f-b43c-de4ad7834ce5.PDR",
    "collectionId": "MOD11A1___006",
    "status": "failed",
    "provider": "LP_TS2_DataPool",
    "progress": 0,
    "execution": "https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/arn:aws:states:us-east-1:433612427488:execution:LpdaacCumulusIngestGranuleStateMachine-N3CLGBXRPAT9:6ef0c52f83c549db58b3a1e50",
    "PANSent": false,
    "PANmessage": "N/A",
    "stats": {
        "processing": 0,
        "completed": 0,
        "failed": 0,
        "total": 0
    },
    "createdAt": 1514305411204,
    "timestamp": 1514305424036,
    "duration": 12.832,
    "_id": "7970bff5-128a-489f-b43c-de4ad7834ce5.PDR"
}
```

## Delete PDR

Delete a PDR from Cumulus. Its granules will remain, and the PDR may be re-discovered and re-ingested/re-processed from scratch in the future.

```endpoint
DELETE /pdrs/{pdrName}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/pdrs/good_25grans.PDR --header 'Authorization: Bearer ReplaceWithTheToken'

```

#### Example response

```json
{
  "message": "Record deleted"
}
```
