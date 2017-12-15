## List PDRs

List PDRs in the Cumulus system.

```endpoint
GET /pdrs
```

#### Example request

```curl
$ curl https://example.com/pdrs --header 'Authorization: Basic Base64EncodedCredentials'
```

#### Example response

```json
{
  "meta": {
    "name": "cumulus-api",
    "table": "cumulus-api-lpdaac-dev-PDRsTable",
    "limit": 1,
    "page": 1,
    "count": 52
  },
  "results": [
    {
      "pdrName": "good_25grans.PDR",
      "createdAt": 1491926374428,
      "address": "s3://cumulus-internal/pdrs/good_25grans.PDR",
      "provider": "LPDAAC_HTTP_MODIS",
      "originalUrl": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/PDR/TEST_CASES/good_25grans.PDR",
      "discoveredAt": 1491926374428,
      "isActive": true,
      "status": "parsed",
      "updatedAt": 1492011755137,
      "timestamp": "2017-04-12T15:42:33.796Z",
      "granulesCount": 25,
      "granulesStatus": {
        "ingesting": 0,
        "cmr": 2,
        "processing": 0,
        "completed": 23,
        "failed": 0,
        "archiving": 0
      },
      "averageDuration": 8.76088011264801,
      "granules": 25,
      "progress": 92
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
$ curl https://example.com/pdrs/good_25grans.PDR --header 'Authorization: Basic Base64EncodedCredentials'
```

#### Example response

```json
{
  "pdrName": "good_25grans.PDR",
  "createdAt": 1491926374428,
  "address": "s3://cumulus-internal/pdrs/good_25grans.PDR",
  "provider": "LPDAAC_HTTP_MODIS",
  "originalUrl": "https://e4ftl01.cr.usgs.gov:40521/TEST_B/Cumulus/PDR/TEST_CASES/good_25grans.PDR",
  "discoveredAt": 1491926374428,
  "isActive": true,
  "status": "parsed",
  "updatedAt": 1492011820301,
  "timestamp": "2017-04-12T15:43:38.539Z",
  "granulesCount": 25,
  "granulesStatus": {
    "ingesting": 0,
    "cmr": 2,
    "processing": 0,
    "completed": 23,
    "failed": 0,
    "archiving": 0
  },
  "averageDuration": 8.76088011264801,
  "granules": 25,
  "progress": 92
}
```

## Delete PDR

Delete a PDR from Cumulus. Its granules will remain, and the PDR may be re-discovered and re-ingested/re-processed from scratch in the future.

```endpoint
DELETE /pdrs/{pdrName}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/pdrs/good_25grans.PDR --header 'Authorization: Basic Base64EncodedCredentials'

```

#### Example response

```json
{
  "detail": "Record deleted"
}
```
