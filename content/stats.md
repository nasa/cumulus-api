## Summary

Retrieve a summary of various metrics for all of the Cumulus engine.

```endpoint
GET /stats
```

#### Example Request

```curl
$ curl https://example.com/stats --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example success response

```json
{
    "errors": {
        "dateFrom": "1970-01-18T12:36:59+00:00",
        "dateTo": "2017-12-26T04:38:15+00:00",
        "value": 2,
        "aggregation": "count",
        "unit": "error"
    },
    "collections": {
        "dateFrom": "1970-01-01T12:00:00+00:00",
        "dateTo": "2017-12-26T04:38:15+00:00",
        "value": 3,
        "aggregation": "count",
        "unit": "collection"
    },
    "processingTime": {
        "dateFrom": "1970-01-18T12:36:59+00:00",
        "dateTo": "2017-12-26T04:38:15+00:00",
        "value": null,
        "aggregation": "average",
        "unit": "second"
    },
    "granules": {
        "dateFrom": "1970-01-18T12:36:59+00:00",
        "dateTo": "2017-12-26T04:38:15+00:00",
        "value": 8,
        "aggregation": "count",
        "unit": "granule"
    }
}
```

## Count

Count the value frequencies for a given field, for a given type of record in Cumulus. Requires the following query parameters, and may include the regular filter parameters:

| query string parameter | description |
| --- | --- |
| `type={providers|collections|granules|pdrs|logs}` | type of Cumulus record to query |
| `field={fieldName}` | which field to count frequencies for; no default |

```endpoint
GET /stats/aggregate
```

#### Example request

```curl
curl 'https://example.com/stats/aggregate?field=status&type=pdrs' --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "meta": {
    "name": "cumulus-api",
    "count": 52,
    "field": "status.keyword"
  },
  "count": [
    {
      "key": "failed",
      "count": 43
    },
    {
      "key": "completed",
      "count": 5
    },
    {
      "key": "parsed",
      "count": 3
    }
  ]
}
```