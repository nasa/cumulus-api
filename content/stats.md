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

## Histogram

Retrieve metrics over various time periods, to produce a histogram for dashboards.

Accepts the following query parameters, _in addition to_ the regular filter parameters:

| query string parameter | description |
| --- | --- |
| `type={providers|collections|granules|pdrs|logs}` | type of Cumulus record to query |
| `field={fieldName}` | which field to query; default is `timestamp` |
| `interval={day|week|month|year}` | "X-axis size" in time of each bar; default is `day` |
| `format={ElasticSearch date format}` | display format for the datetime in the response, accepts any [ElasticSearch date format](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-date-format.html); default is `yyyy-MM-dd` |

```endpoint
GET /stats/histogram
```

#### Example request

```curl
curl 'https://example.com/stats/histogram?interval=day&status=completed&type=granules&updatedAt__from=2017-04-05T12:59:35-04:00' --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "meta": {
    "name": "cumulus-api",
    "count": 29,
    "criteria": {
      "field": "timestamp",
      "interval": "day",
      "format": "yyyy-MM-dd"
    }
  },
  "histogram": [
    {
      "date": "2017-04-06",
      "count": 3
    },
    {
      "date": "2017-04-07",
      "count": 1
    },
    {
      "date": "2017-04-08",
      "count": 0
    },
    {
      "date": "2017-04-09",
      "count": 0
    },
    {
      "date": "2017-04-10",
      "count": 0
    },
    {
      "date": "2017-04-11",
      "count": 24
    },
    {
      "date": "2017-04-12",
      "count": 1
    }
  ]
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

## Average

Calculate the average value and other summary statistics for a given numeric field. Requires the following query parameters, and may include the regular filter parameters:

| query string parameter | description |
| --- | --- |
| `type={providers|collections|granules|pdrs|logs}` | type of Cumulus record to query |
| `field={fieldName}` | which field to count frequencies for, must be numeric; no default |

```endpoint
GET /stats/average
```

#### Example request

```curl
curl 'https://example.com/stats/average?field=duration&type=granules' --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
{
  "meta": {
    "name": "cumulus-api",
    "count": 34,
    "field": "duration"
  },
  "stats": {
    "count": 34,
    "min": 1.7050000429153442,
    "max": 868.7949829101562,
    "avg": 40.43520551919937,
    "sum": 1374.7969876527786,
    "sum_of_squares": 771227.9831936971,
    "variance": 21048.170130905317,
    "std_deviation": 145.0798750030662,
    "std_deviation_bounds": {
      "upper": 330.5949555253318,
      "lower": -249.72454448693304
    }
  }
}
```
