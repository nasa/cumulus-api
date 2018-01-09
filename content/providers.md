## List providers

List providers in the Cumulus system.

```endpoint
GET /providers
```

#### Example request

```curl
$ curl https://example.com/providers --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "provider",
        "limit": 1,
        "page": 1,
        "count": 2
    },
    "results": [
        {
            "id": "LP_TS2_DataPool",
            "globalConnectionLimit": 10,
            "protocol": "http",
            "host": "https://e4ftl01.cr.usgs.gov:40521/",
            "timestamp": 1508861082226
        }
    ]
}
```

## Retrieve provider

Retrieve a single provider.

```endpoint
GET /providers/{id}
```

#### Example request

```curl
$ curl https://example.com/providers/LPDAAC_HTTP_MODIS --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "createdAt": 1508861081785,
    "id": "LP_TS2_DataPool",
    "host": "https://e4ftl01.cr.usgs.gov:40521/",
    "globalConnectionLimit": 10,
    "updatedAt": 1508861081785,
    "protocol": "http"
}
```

## Create provider

Create a provider.

```endpoint
POST /providers
```

#### Example request

```curl
$ curl --request POST https://example.com/providers --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
    "changedBy": "Cumulus Dashboard",
    "createdAt": 1491941727851,
    "host": "https://www.example.gov",
    "id": "MY_DAAC_SATELLITE",
    "path": "/satellite/pdrs",
    "protocol": "http",
    "providerName": "MY_DAAC",
    "updatedAt": 1491941727851
}'
```

#### Example response

```json
{
    "message": "Record saved",
    "record": {
        "createdAt": 1491941727851,
        "host": "https://www.example.gov",
        "id": "MY_DAAC_SATELLITE",
        "protocol": "http",
        "updatedAt": 1513956150733,
        "globalConnectionLimit": 10,
        "timestamp": 1513956151186
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
$ curl --request PUT https://example.com/providers/MY_DAAC_SATELLITE --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
    "host": "https://www.example.co.uk"
}'
```

#### Example response

```json
{
    "createdAt": 1491941727851,
    "id": "MY_DAAC_SATELLITE",
    "host": "https://www.example.co.uk",
    "globalConnectionLimit": 10,
    "updatedAt": 1513956150733,
    "protocol": "http",
    "timestamp": 1513956555713
}
```

## Restart provider

Restart a provider. If the provider's `status` value had been `stopped` or `failed`, it will leave that status and return to searching for new PDRs to process.

```endpoint
PUT /providers/{id}
```

#### Example request

```curl
$ curl --request PUT https://example.com/providers/MY_DAAC_SATELLITE --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"action": "restart"}'
```

#### Example response

```json
{
    "createdAt": 1491941727851,
    "id": "MY_DAAC_SATELLITE",
    "host": "https://www.example.co.uk",
    "globalConnectionLimit": 10,
    "updatedAt": 1513956555642,
    "protocol": "http",
    "action": "restart",
    "timestamp": 1513956779541
}
```

## Stop provider

Set a provider's `status` to `stopped`. This halts all processing of granules associated with the provider.

```endpoint
PUT /providers/{id}
```

#### Example request

```curl
$ curl --request PUT https://example.com/providers/MY_DAAC_SATELLITE --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"action": "stop"}'
```

#### Example response

```json
{
    "action": "stop",
    "host": "https://www.example.co.uk",
    "updatedAt": 1513956779503,
    "protocol": "http",
    "createdAt": 1491941727851,
    "id": "MY_DAAC_SATELLITE",
    "globalConnectionLimit": 10,
    "timestamp": 1513956816160
}
```

## Delete provider

Delete a provider from Cumulus. The related PDRs and granules remain in the Cumulus and CMR systems.

```endpoint
DELETE /providers/{id}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/providers/MY_DAAC_SATELLITE --header 'Authorization: Bearer ReplaceWithTheToken'

```

#### Example response

```json
{
  "message": "Record deleted"
}
```
