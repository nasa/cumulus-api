## List rules

List rules in the Cumulus system.

```endpoint
GET /rules
```

#### Example request

```curl
$ curl https://example.com/rules --header 'Authorization: Bearer ReplaceWithTheToken'
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
GET /rules/{name}
```

#### Example request

```curl
$ curl https://example.com/rules/repeat --header 'Authorization: Bearer ReplaceWithTheToken'
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
| `state` | `"DISABLED"`&vert;`"ENABLED"` | rule state (default: ENABLED) |
| `workflow` | `string` | name of workflow started by the rule |
| `rule` | `Object` | rule object |
| `-- rule.type` | `"onetime"`&vert;`"scheduled"`&vert;`"kinesis"`&vert;`"sns"`&vert;`"sqs"` | rule trigger type |
| `-- rule.value` | `onetime`: N/A<br>`scheduled`: cron-type or rate expression<br>`kinesis`: Kinesis stream ARN<br>`sns`: SNS topic ARN<br>`sqs`: SQS queue URL | required value differs by type |
| `-- rule.arn` | `string` | `kinesis` scheduled event arn |
| `-- rule.logEventArn` | `string` | `kinesis` scheduled log event arn |
| `provider` | `string` | provider record provided to workflow (optional) |
| `collection` | `Object` | collection record provided to workflow (optional) |
| `-- collection.name` | `string` | collection name |
| `-- collection.version` | `string` | collection version |
| `meta` | `Object` | contents to add to workflow input's `meta` field |
| `tags` | `array` | Optional tags (for search) |

```endpoint
POST /rules
```

#### Example request

```curl
$ curl --request POST https://example.com/rules --header 'Authorization: Bearer ReplaceWithToken' --header 'Content-Type: application/json' --data '{
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
    "meta": { "publish": false },
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

## Update/replace rule

Update/replace an existing rule. Expects payload to specify the entire
rule object, and will completely replace the existing rule with the
specified payload. For a field reference see ["Create rule"](#create-rule).

Returns status 200 on successful replacement, 400 if the `name` property in the
payload does not match the corresponding value in the resource URI, or 404 if
there is no rule with the specified name.

Special case:

| Field | Value | Description |
| --- | --- | --- |
| `action` | `"rerun"` | rerun rule (`onetime` rule only) |

```endpoint
PUT /rules/{name}
```

#### Example request

```curl
$ curl --request PUT https://example.com/rules/repeat_test --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{
  "name": "repeat_test",
  "workflow": "DiscoverPdrs",
  "collection": {
    "name": "AST_L1A",
    "version": "003"
  },
  "provider": "local",
  "rule": {
    "type": "scheduled",
    "value": "rate(5 minutes)"
  },
  "state": "ENABLED"
}'
```

#### Example successful response

```json
{
  "name": "repeat_test",
  "workflow": "DiscoverPdrs",
  "collection": {
    "name": "AST_L1A",
    "version": "003"
  },
  "updatedAt": 1521755265130,
  "createdAt": 1510903518741,
  "provider": "local",
  "rule": {
    "type": "scheduled",
    "value": "rate(5 minutes)"
  },
  "state": "ENABLED"
}
```

#### Rerun request (`onetime`-rule special case)

```curl
$ curl --request PUT https://example.com/rules/my_onetime_rule --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{"action": "rerun"}'
```

## Delete rule

Delete a rule from Cumulus.

```endpoint
DELETE /rules/{name}
```

#### Example request

```curl
$ curl --request DELETE https://example.com/rules/repeat_test --header 'Authorization: Bearer ReplaceWithTheToken'

```

#### Example response

```json
{
  "message": "Record deleted"
}
```
