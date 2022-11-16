## ORCA

This endpoint authenticates and forwards requests to the ORCA private API, and returns the response from the ORCA API.  Please refer to [ORCA API reference](https://nasa.github.io/cumulus-orca/docs/developer/api/orca-api) on how to use ORCA API.

```endpoint
POST /orca
```

#### Example request

```curl
$ curl --request POST https://example.com/orca/recovery/granules --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json'  --data '{
  "granuleId": "MOD14A1.061.H5V12.2020312.141531789"
}'
```
