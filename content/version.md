## Versioning

The Cumulus API is versioned and the current version is v2. Retrieve the latest API version from Cumulus.

```endpoint
GET /version
```

To use any version, include the version number in the path before the query endpoint. `{API_URL}/{version}/{query}`

#### Example Request
```curl
$ curl https://example.com/version
```

#### Example Response
```json
{
    "response_version": "v2",
    "api_version": "2.0.0"
}
```

