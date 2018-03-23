## List rules

List rules in the Cumulus system.

```endpoint
GET /v1/rules
```

#### Example request

```curl
$ curl https://example.com/v1/rules --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "meta": {
        "name": "cumulus-api",
        "stack": "lpdaac-cumulus",
        "table": "rule",
        "limit": 1,
        "page": 1,
        "count": 7
    },
    "results": [
        {
            "name": "repeat",
            "workflow": "DiscoverPdrs",
            "provider": "local",
            "collection": {
                "name": "AST_L1A",
                "version": "003"
            },
            "rule": {
                "type": "scheduled",
                "value": "rate(5 minutes)"
            },
            "timestamp": 1511232462534,
            "state": "DISABLED"
        }
    ]
}
```

## Retrieve rule

Retrieve a single rule.

```endpoint
GET /v1/rules/{name}
```

#### Example request

```curl
$ curl https://example.com/v1/rules/repeat --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
    "workflow": "DiscoverPdrs",
    "collection": {
        "name": "AST_L1A",
        "version": "003"
    },
    "updatedAt": 1511232462507,
    "createdAt": 1510903518741,
    "provider": "local",
    "name": "repeat",
    "rule": {
        "type": "scheduled",
        "value": "rate(5 minutes)"
    },
    "state": "DISABLED"
}
```

## Create rule

Create a rule.

```endpoint
POST /v1/rules
```

#### Example request

```curl
$ curl --request POST https://example.com/v1/rules --header 'Authorization: Bearer ReplaceWithToken' --data '{
    "workflow": "DiscoverPdrs",
    "collection": {
        "name": "AST_L1A",
        "version": "003"
    },
    "updatedAt": 1511232462507,
    "createdAt": 1510903518741,
    "provider": "local",
    "name": "repeat_test",
    "rule": {
        "type": "scheduled",
        "value": "rate(5 minutes)"
    },
    "state": "DISABLED"
}'
```

#### Example response

```json
{
    "message": "Record saved",
    "record": {
        "workflow": "DiscoverPdrs",
        "collection": {
            "name": "AST_L1A",
            "version": "003"
        },
        "updatedAt": 1515966212264,
        "createdAt": 1510903518741,
        "provider": "local",
        "name": "repeat_test",
        "rule": {
            "type": "scheduled",
            "value": "rate(5 minutes)"
        },
        "state": "DISABLED",
        "timestamp": 1515966212713
    }
}
```

## Update rule

Update rules for a collection. Can accept the whole rule object, or just a subset of fields, the ones that are being updated. Returns a mapping of the updated properties.

```endpoint
PUT /v1/rules/{name}
```

#### Example request

```curl
$ curl --request PUT https://example.com/v1/rules/repeat_test --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"state": "ENABLED"}'
```

#### Example response

```json
{
    "workflow": "DiscoverPdrs",
    "collection": {
        "name": "AST_L1A",
        "version": "003"
    },
    "updatedAt": 1521755265130,
    "createdAt": 1510903518741,
    "provider": "local",
    "name": "repeat_test",
    "rule": {
        "type": "scheduled",
        "value": "rate(5 minutes)"
    },
    "state": "ENABLED"
}
```

## Delete rule

Delete a rule from Cumulus.

```endpoint
DELETE /v1/rules/{name}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/v1/rules/repeat_test --header 'Authorization: Bearer ReplaceWithTheToken'

```

#### Example response

```json
{
  "message": "Record deleted"
}
```
