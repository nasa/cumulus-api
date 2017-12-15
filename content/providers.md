## List providers

List providers in the Cumulus system.

```endpoint
GET /providers
```

#### Example request

```curl
$ curl https://example.com/providers --header 'Authorization: Basic Base64EncodedCredentials'
```

#### Example response

```json
{
  "meta": {
    "name": "cumulus-api",
    "table": "cumulus-api-lpdaac-prod-ProvidersTable",
    "limit": 1,
    "page": 1,
    "count": 4
  },
  "results": [
    {
      "createdAt": 1491939230662,
      "path": "/TEST_B/Cumulus/MODIS/PDR/",
      "protocol": "http",
      "regex": {
        "MOD11A1__version__006": "(MOD11A1\\.(.*))\\.hdf"
      },
      "host": "https://e4ftl01.cr.usgs.gov:40521",
      "name": "LPDAAC_HTTP_MODIS",
      "isActive": true,
      "providerName": "LP DAAC",
      "status": "ingesting",
      "updatedAt": 1491940611371,
      "timestamp": "2017-04-11T19:56:53.863Z",
      "lastTimeIngestedAt": 1491940611371
    }
  ]
}
```

## Retrieve provider

Retrieve a single provider.

```endpoint
GET /providers/{name}
```

#### Example request

```curl
$ curl https://example.com/providers/LPDAAC_HTTP_MODIS --header 'Authorization: Basic Base64EncodedCredentials'
```

#### Example response

```json
{
  "createdAt": 1491939230662,
  "path": "/TEST_B/Cumulus/MODIS/PDR/",
  "protocol": "http",
  "regex": {
    "MOD11A1__version__006": "(MOD11A1\\.(.*))\\.hdf"
  },
  "host": "https://e4ftl01.cr.usgs.gov:40521",
  "name": "LPDAAC_HTTP_MODIS",
  "isActive": true,
  "providerName": "LP DAAC",
  "status": "ingesting",
  "updatedAt": 1491940551376,
  "timestamp": "2017-04-11T19:55:53.960Z",
  "lastTimeIngestedAt": 1491940551376
}
```

## Create provider

Create a provider.

```endpoint
POST /providers
```

#### Example request

```curl
$ curl --request POST https://example.com/providers --header 'Authorization: Basic Base64EncodedCredentials' --data '{
    "changedBy": "Cumulus Dashboard",
    "createdAt": 1491941727851,
    "host": "https://www.example.gov",
    "name": "MY_DAAC_SATELLITE",
    "path": "/satellite/pdrs",
    "protocol": "http",
    "providerName": "MY_DAAC",
    "updatedAt": 1491941727851
}'
```

#### Example response

```json
{
    "detail": "Record saved",
    "record": {
        "createdAt": 1491941727851,
        "host": "https://www.example.gov",
        "isActive": false,
        "name": "MY_DAAC_SATELLITE",
        "path": "/satellite/pdrs",
        "protocol": "http",
        "providerName": "MY_DAAC",
        "regex": {},
        "status": "stopped",
        "updatedAt": 1491943167416
    }
}
```

## Update provider

Update values for a provider. Can accept the whole provider object, or just a subset of fields, the ones that are being updated.

```endpoint
PUT /providers
```

#### Example request

```curl
$ curl --request PUT https://example.com/providers/MY_DAAC_SATELLITE --header 'Authorization: Basic Base64EncodedCredentials' --data '{
    "host": "https://www.example.co.uk"
}'
```

#### Example response

```json
{
    "createdAt": 1491941727851,
    "host": "https://www.example.co.uk",
    "isActive": false,
    "name": "MY_DAAC_SATELLITE",
    "path": "/satellite/pdrs",
    "protocol": "http",
    "providerName": "MY_DAAC",
    "regex": {},
    "status": "stopped",
    "updatedAt": 1491944299059
}
```

## Restart provider

Restart a provider. If the provider's `status` value had been `stopped` or `failed`, it will leave that status and return to searching for new PDRs to process.

```endpoint
PUT /providers/{name}
```

#### Example request

```curl
$ curl --request PUT https://example.com/providers/MY_DAAC_SATELLITE --header 'Authorization: Basic Base64EncodedCredentials' --data '{"action": "restart"}'
```

#### Example response

```json
{
    "createdAt": 1491941727851,
    "host": "https://www.example.gov",
    "isActive": true,
    "name": "MY_DAAC_SATELLITE",
    "path": "/satellite/pdrs",
    "protocol": "http",
    "providerName": "MY_DAAC",
    "regex": {},
    "status": "ingesting",
    "updatedAt": 1491945342808
}
```

## Stop provider

Set a provider's `status` to `stopped`. This halts all processing of granules associated with the provider.

```endpoint
PUT /providers/{name}
```

#### Example request

```curl
$ curl --request PUT https://example.com/providers/MY_DAAC_SATELLITE --header 'Authorization: Basic Base64EncodedCredentials' --data '{"action": "stop"}'
```

#### Example response

```json
{
    "createdAt": 1491941727851,
    "host": "https://www.example.gov",
    "isActive": false,
    "name": "MY_DAAC_SATELLITE",
    "path": "/satellite/pdrs",
    "protocol": "http",
    "providerName": "MY_DAAC",
    "regex": {},
    "status": "stopped",
    "updatedAt": 1491945512946
}
```

## Delete provider

Delete a provider from Cumulus. The related PDRs and granules remain in the Cumulus and CMR systems.

```endpoint
DELETE /providers/{name}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/providers/MY_DAAC_SATELLITE --header 'Authorization: Basic Base64EncodedCredentials'

```

#### Example response

```json
{
  "detail": "Record deleted"
}
```
