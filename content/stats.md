## Summary

Retrieve a summary of various metrics for all of the Cumulus engine.

```endpoint
GET /stats
```

#### Example Request

```curl
$ curl https://example.com/stats --header 'Authorization: Bearer ReplceWithTheToken'
```

#### Example success response

```json
{
  "errors": {
    "dateFrom": "1970-01-18T06:25:29+00:00",
    "dateTo": "2017-04-12T04:55:27+00:00",
    "value": 158,
    "aggregation": "count",
    "unit": "error"
  },
  "collections": {
    "dateFrom": "1970-01-01T12:00:00+00:00",
    "dateTo": "2017-04-12T04:55:27+00:00",
    "value": 4,
    "aggregation": "count",
    "unit": "collection"
  },
  "processingTime": {
    "dateFrom": "1970-01-18T06:25:29+00:00",
    "dateTo": "2017-04-12T04:55:27+00:00",
    "value": 54.05747180514865,
    "aggregation": "average",
    "unit": "second"
  },
  "granules": {
    "dateFrom": "1970-01-18T06:25:29+00:00",
    "dateTo": "2017-04-12T04:55:27+00:00",
    "value": 36,
    "aggregation": "count",
    "unit": "granule"
  },
  "resources": [
    {
      "s3": [
        {
          "bucket": "cumulus-private",
          "Sum": 770681495866,
          "Unit": "Bytes",
          "Timestamp": {}
        },
        {
          "bucket": "cumulus-public",
          "Sum": 1625772229,
          "Unit": "Bytes",
          "Timestamp": {}
        },
        {
          "bucket": "cumulus-protected",
          "Sum": 2720993174445,
          "Unit": "Bytes",
          "Timestamp": {}
        },
        {
          "bucket": "cumulus-internal",
          "Sum": 2688662529050,
          "Unit": "Bytes",
          "Timestamp": {}
        }
      ],
      "createdAt": 1492016051264,
      "instances": [
        {
          "pendingTasks": 0,
          "availableMemory": 6450,
          "availableCpu": 1993,
          "id": "i-084ebffda1e5f4f6c",
          "runningTasks": 4,
          "status": "ACTIVE"
        },
        {
          "pendingTasks": 0,
          "availableMemory": 6450,
          "availableCpu": 1993,
          "id": "i-04e019987a688d0ed",
          "runningTasks": 4,
          "status": "ACTIVE"
        }
      ],
      "queues": [
        {
          "messagesAvailable": "0",
          "name": "cumulus-api-lpdaac-dev-PDRsQueue",
          "messagesInFlight": "0"
        },
        {
          "messagesAvailable": "0",
          "name": "cumulus-api-lpdaac-dev-GranulesQueue",
          "messagesInFlight": "0"
        },
        {
          "messagesAvailable": "0",
          "name": "cumulus-api-lpdaac-dev-ProcessingQueue",
          "messagesInFlight": "0"
        },
        {
          "messagesAvailable": "562",
          "name": "cumulus-api-lpdaac-dev-DispatcherFailedQueue",
          "messagesInFlight": "0"
        }
      ],
      "services": [
        {
          "pendingCount": 0,
          "desiredCount": 1,
          "name": "cumulus-api-lpdaac-dev-discoverPdrsECSService-6YW4ICJMNAT1",
          "runningCount": 1,
          "status": "ACTIVE"
        },
        {
          "pendingCount": 0,
          "desiredCount": 1,
          "name": "cumulus-api-lpdaac-dev-ecsrunnerECSService-UNZYDBT4VQG",
          "runningCount": 1,
          "status": "ACTIVE"
        },
        {
          "pendingCount": 0,
          "desiredCount": 4,
          "name": "cumulus-api-lpdaac-dev-ingestGranulesECSService-14DH5QS8SBT1C",
          "runningCount": 4,
          "status": "ACTIVE"
        },
        {
          "pendingCount": 0,
          "desiredCount": 1,
          "name": "cumulus-api-lpdaac-dev-parsePdrsECSService-13TX7LIJHUUWG",
          "runningCount": 1,
          "status": "ACTIVE"
        },
        {
          "pendingCount": 0,
          "desiredCount": 1,
          "name": "cumulus-api-lpdaac-dev-jobsECSService-Z6ZGBLE2C83T",
          "runningCount": 1,
          "status": "ACTIVE"
        }
      ],
      "tasks": {
        "pendingTasks": 0,
        "runningTasks": 8
      },
      "updatedAt": 1492016051264,
      "timestamp": "2017-04-12T16:54:09.508Z"
    }
  ]
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
curl 'https://example.com/stats/histogram?interval=day&status=completed&type=granules&updatedAt__from=2017-04-05T12:59:35-04:00' --header 'Authorization: Bearer ReplceWithTheToken'
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
curl 'https://example.com/stats/aggregate?field=status&type=pdrs' --header 'Authorization: Bearer ReplceWithTheToken'
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
curl 'https://example.com/stats/average?field=duration&type=granules' --header 'Authorization: Bearer ReplceWithTheToken'
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
