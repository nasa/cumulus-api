## List logs

List processing logs from the Cumulus engine. A log's `level` field may be either `info` or `error`.

```endpoint
GET /logs
```

#### Example request

```curl
$ curl https://example.com/logs?limit=5 --header 'Authorization: Basic Base64EncodedCredentials'
```

#### Example response

```json
{
  "meta": {
    "name": "cumulus-api",
    "table": null,
    "limit": 5,
    "page": 1,
    "count": 86239
  },
  "results": [
    {
      "level": "info",
      "data": "\"No active provider found\"",
      "meta": {
        "file": "lambdas/pdr/discover.js",
        "type": "ingesting",
        "source": "discover"
      },
      "timestamp": "2017-04-12T18:34:44.553Z"
    },
    {
      "level": "info",
      "data": "\"Latest AWS resources stats saved to DynamoDB\"",
      "meta": {},
      "timestamp": "2017-04-12T18:34:13.741Z"
    },
    {
      "level": "info",
      "data": "\"Getting latest AWS resources stats\"",
      "meta": {},
      "timestamp": "2017-04-12T18:34:13.524Z"
    },
    {
      "level": "info",
      "data": "\"No active provider found\"",
      "meta": {
        "file": "lambdas/pdr/discover.js",
        "type": "ingesting",
        "source": "discover"
      },
      "timestamp": "2017-04-12T18:33:44.512Z"
    },
    {
      "level": "info",
      "data": "\"No active provider found\"",
      "meta": {
        "file": "lambdas/pdr/discover.js",
        "type": "ingesting",
        "source": "discover"
      },
      "timestamp": "2017-04-12T18:32:44.510Z"
    }
  ]
}
```

#### Example request for errors

```curl
$ curl https://example.com/logs?level=error --header 'Authorization: Basic Base64EncodedCredentials'
```

#### Example response for errors

```json
{
  "meta": {
    "name": "cumulus-api",
    "table": null,
    "limit": 1,
    "page": 1,
    "count": 158
  },
  "results": [
    {
      "level": "error",
      "data": "\"[TypeError: Cannot read property 'count' of undefined]\"",
      "meta": {
        "file": "lambdas/jobs/index.js",
        "type": "backgroundJobs",
        "source": "jobs"
      },
      "timestamp": "2017-04-12T09:05:59.527Z"
    }
  ]
}
```
