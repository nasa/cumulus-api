## Instance Metadata

The Cumulus API can provide information about its configuration.

GET requests to the instance metadata endpoint return a json object with information about how the Cumulus stack is configured. It returns the CMR provider and environment as well as the stackName (prefix).

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
  },
  "cumulus": {
    "stackName": "cumulus-stack-prefix"
  }
}
```
