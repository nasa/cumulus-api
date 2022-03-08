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
GET /providers/{id}
```

#### Example request

```curl
$ curl https://example.com/providers/HTTP_MODIS --header 'Authorization: Bearer ReplaceWithTheToken'
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
| `protocol` | `"s3"`&vert;`"http"`&vert;`"https"`&vert;`"ftp"` | file transfer (sync) protocol |
| `host` | `string` | provider host endpoint |
| `port` | `number` | provider host port |
| `globalConnectionLimit` | `number` | limit to number of concurrent connections |
| `username` | `string` | provider connection username |
| `password` | `string` | provider connection password |
| `privateKey` | `string` | filename assumed to be in s3://bucketInternal/stackName/crypto |
| `cmKeyId` | `string` | AWS KMS Customer Master Key arn or alias |
| `allowedRedirects` | `Array<string>` | Only hosts in this list will have the provider username/password forwarded for authentication. Entries should be specified as host.com or host.com:7000 if redirect port is different than the provider port. |
| `certificateUri` | `string` | Optional SSL Certificate S3 URI for custom or self-signed SSL (TLS) certificate |

```endpoint
POST /providers
```

#### Example request

```curl
$ curl --request POST https://example.com/providers --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{
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

## Update/replace provider

Update/replace an existing provider. Expects payload to specify the entire
provider object, and will completely replace the existing provider with the
specified payload. For a field reference see
["Create provider"](#create-provider).

Returns status 200 on successful replacement, 400 if the `id` property in the
payload does not match the corresponding value in the resource URI, or 404 if
there is no provider with the specified ID.

```endpoint
PUT /providers/{id}
```

#### Example request

```curl
$ curl --request PUT https://example.com/providers/MY_DAAC_SATELLITE --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{
  "id": "MY_DAAC_SATELLITE",
  "host": "https://www.example.co.uk",
  "globalConnectionLimit": 10,
  "protocol": "http"
}'
```

#### Example successful response

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
