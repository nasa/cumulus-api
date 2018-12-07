## List providers

List providers in the Cumulus system.

```endpoint
GET /v1/providers
```

#### Example request

```curl
$ curl https://example.com/v1/providers --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "daac-cumulus",
        "table": "provider",
        "limit": 1,
        "page": 1,
        "count": 2
    },
    "results": [
        {
            "id": "HTTP_MODIS",
            "globalConnectionLimit": 10,
            "protocol": "http",
            "host": "https://data.modis.gov/",
            "timestamp": 1508861082226
        }
    ]
}
```

## Retrieve provider

Retrieve a single provider.

```endpoint
GET /v1/providers/{id}
```

#### Example request

```curl
$ curl https://example.com/v1/providers/HTTP_MODIS --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "createdAt": 1508861081785,
    "id": "HTTP_MODIS",
    "host": "https://data.modis.gov/",
    "globalConnectionLimit": 10,
    "updatedAt": 1508861081785,
    "protocol": "http"
}
```

## Create provider

Create a provider. For more information on creating providers and the contents of a request see [the Cumulus setup documentation](https://nasa.github.io/cumulus/docs/data-cookbooks/setup#providers).

Overview of the schema fields:

| Field | Value | Description |
| --- | --- | --- |
| `id` | `string` | provider id/name |
| `protocol` | `"s3"|"http"|"https"|ftp` | file transfer (sync) protocol |
| `host` | `string` | provider host endpoint |
| `globalConnectionLimit` | `number` | limit to number of concurrent connections |
| `username` | `string` | ftp username |
| `password` | `string` | ftp password |

```endpoint
POST /v1/providers
```

#### Example request

```curl
$ curl --request POST https://example.com/v1/providers --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
    "host": "https://www.example.gov",
    "id": "MY_DAAC_SATELLITE",
    "protocol": "http",
    "globalConnectionLimit": 10
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
        "globalConnectionLimit": 10,
        "timestamp": 1513956151186
    }
}
```

## Update provider

Update values for a provider. Can accept the whole provider object, or just a subset of fields, the ones that are being updated.

```endpoint
PUT /v1/providers
```

#### Example request

```curl
$ curl --request PUT https://example.com/v1/providers/MY_DAAC_SATELLITE --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
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
PUT /v1/providers/{id}
```

#### Example request

```curl
$ curl --request PUT https://example.com/v1/providers/MY_DAAC_SATELLITE --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"action": "restart"}'
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
PUT /v1/providers/{id}
```

#### Example request

```curl
$ curl --request PUT https://example.com/v1/providers/MY_DAAC_SATELLITE --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"action": "stop"}'
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
DELETE /v1/providers/{id}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/v1/providers/MY_DAAC_SATELLITE --header 'Authorization: Bearer ReplaceWithTheToken'

```

#### Example response

```json
{
  "message": "Record deleted"
}
```
