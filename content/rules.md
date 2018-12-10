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

Create a rule. For more information on creating rules and the contents of a request see [the Cumulus setup documentation](https://nasa.github.io/cumulus/docs/data-cookbooks/setup#rules).

Overview of the schema fields:

| Field | Value | Description |
| --- | --- | --- |
| `name` | `string` | rule name (letters, numbers, underscores only) |
| `state` | `"DISABLED" | "ENABLED"` | rule state (default: ENABLED) |
| `workflow` | `string` | name of workflow started by the rule |
| `rule` | `Object` | rule object |
| `-- rule.type` | `"onetime"|"scheduled"|"kinesis"|"sns"` | rule trigger type |
| `-- rule.value` | `onetime`: N/A<br>`scheduled`: cron-type or rate expression<br>`kinesis`: Kinesis stream ARN<br>`sns`: SNS topic ARN | required value differs by type |
| `provider` | `string` | provider record provided to workflow (optional) |
| `collection` | `Object` | collection record provided to workflow (optional) |
| `-- collection.name` | `string` | collection name |
| `-- collection.version` | `string` | collection version |
| `meta` | `Object` | contents to add to workflow input's `meta` field |

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
    "provider": "local",
    "name": "repeat_test",
    "rule": {
        "type": "scheduled",
        "value": "rate(5 minutes)"
    },
    meta: { "publish": false },
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
        "createdAt": 1510903518741,
        "provider": "local",
        "name": "repeat_test",
        "rule": {
            "type": "scheduled",
            "value": "rate(5 minutes)"
        },
        "meta": { "publish": false },
        "state": "DISABLED",
    }
}
```

## Update rule

Update rules for a collection. Can accept the whole rule object, or just a subset of fields, the ones that are being updated. Returns a mapping of the updated properties. For a field reference see the ["Create rule"](#create-rule) section.

Special case:

| Field | Value | Description |
| --- | --- | --- |
| `action` | `"rerun"` | rerun rule (`onetime` rule only) |

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

#### Rerun request (`onetime`-rule special case)

```curl
$ curl --request PUT https://example.com/v1/rules/my_onetime_rule --header 'Authorization: Bearer ReplaceWithTheToken' --data '{"action": "rerun"}'
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
