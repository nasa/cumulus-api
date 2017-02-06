## List

Lists errors reported by Splunk.

```endpoint
GET /errors
```

#### Example Request

```curl
$ curl https://workflow.ds.io/errors -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example success response

```json
[
    {
        "timestamp": "2016-09-22T14:39:23.651637",
        "dataset_id": "hamsr",
        "process": "File process",
        "message": "Something went terribly wrong again"
    },
    {
        "timestamp": "2016-09-22T14:39:23.649773",
        "dataset_id": "cpl",
        "process": "File process",
        "message": "Something went terribly wrong again"
    }
]
```
