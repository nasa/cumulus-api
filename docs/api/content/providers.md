## List providers

List providers in the Cumulus engine. 

```endpoint
GET /providers
```

#### Example request

```curl
$ curl https://cumulus.developmentseed.org/api/dev/providers --header 'Authorization: TokenFromAuthorizationEndpoint'
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
$ curl https://cumulus.developmentseed.org/api/dev/providers/LPDAAC_HTTP_MODIS --header 'Authorization: TokenFromAuthorizationEndpoint'
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
$ curl --request POST https://cumulus.developmentseed.org/api/dev/providers --header 'Authorization: TokenFromAuthorizationEndpoint' --data '{
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

Update values for a provider. Can accept a subset of the provider fields, or the whole provider object.

```endpoint
PUT /providers
```

#### Example request

```curl
$ curl --request PUT https://cumulus.developmentseed.org/api/dev/providers/MY_DAAC_SATELLITE --header 'Authorization: TokenFromAuthorizationEndpoint' --data '{
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

Restart a provider. This causes all associated granules to begin processing from scratch.

```endpoint
PUT /providers/{name}
```

#### Example request

```curl
$ curl --request PUT https://cumulus.developmentseed.org/api/dev/providers/MY_DAAC_SATELLITE --header 'Authorization: TokenFromAuthorizationEndpoint' --data '{"action": "restart"}'
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

Set a provider's status to `stopped`. This halts all processing of granules associated with the provider.

```endpoint
PUT /providers/{name}
```

#### Example request

```curl
$ curl --request PUT https://cumulus.developmentseed.org/api/dev/providers/MY_DAAC_SATELLITE --header 'Authorization: TokenFromAuthorizationEndpoint' --data '{"action": "stop"}'
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

Delete a provider from Cumulus.

```endpoint
DELETE /providers/{name}
```

#### Example request

```curl
$ curl --request DELETE https://cumulus.developmentseed.org/api/dev/providers/MY_DAAC_SATELLITE --header 'Authorization: TokenFromAuthorizationEndpoint'

```

#### Example response

```json
{
  "detail": "Record deleted"
}
```
