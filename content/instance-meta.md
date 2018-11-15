## Instance Metadata

The Cumulus API can provide information about its configuration.

GET requests to the instance metadata endpoint return a json object with information about how cumulus is configured to talk to CMR.

```endpoint
GET /instanceMeta
```

#### Example Request
```curl
$ curl https://example.com/instanceMeta --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example Response
```json
{
  "cmr": {
    "provider": "CUMULUS",
    "environment": "UAT"
  }
}
```
