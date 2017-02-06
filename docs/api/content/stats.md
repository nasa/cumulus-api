## Summary

Returns a summary of various metrics for the whole system

```endpoint
GET /stats/summary
```

#### Example Request

```curl
$ curl https://workflow.ds.io/stats/summary -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example success response

```json
{
    "activeDatasets": 6,
    "totalUsers": 4,
    "granules": 2065,
    "downloads": 72,
    "errors": {
        "datasets": 2,
        "total": 10
    },
    "updatedAt": 1476190903330,
    "bandwidth": 0,
    "storageUsed": 0
}
```

## Summary Grouped

Returns stats grouped by type and date

```endpoint
GET /stats/summary/grouped
```

#### Example Request

```curl
$ curl https://workflow.ds.io/stats/summary/grouped -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example success response

```json
{
    "granulesPublished": {
        "2016-09-22": 166,
        "2016-09-21": 23,
        "2016-09-20": 48,
        "2016-09-19": 11,
        "2016-09-18": 102,
        "2016-09-17": 73,
        "2016-09-16": 167,
        "2016-09-15": 65,
        "2016-09-14": 113,
        "2016-09-13": 163
    },
    "granulesDownloaded": {
        "2016-09-22": 74,
        "2016-09-21": 66,
        "2016-09-20": 99,
        "2016-09-19": 117,
        "2016-09-18": 116,
        "2016-09-17": 118,
        "2016-09-16": 8,
        "2016-09-15": 100,
        "2016-09-14": 18,
        "2016-09-13": 43
    },
    "downloadsPerDataSet": {
        "hs3cpl": 66,
        "hs3hirad": 99,
        "hs3hiwrap": 117,
        "hs3hamsr": 116,
        "hs3wwlln": 118
    },
    "totalGranules": {
        "2016-09-22": 47,
        "2016-09-21": 67,
        "2016-09-20": 59,
        "2016-09-19": 19,
        "2016-09-18": 108,
        "2016-09-17": 174,
        "2016-09-16": 0,
        "2016-09-15": 52,
        "2016-09-14": 12,
        "2016-09-13": 123
    },
    "topCountries": {
        "USA": 320,
        "Germany": 10,
        "China": 24,
        "UK": 78,
        "France": 110,
        "Brazil": 43,
        "Chile": 21,
        "Mexico": 98,
        "Canada": 45
    },
    "numberOfUsers": {
        "2016-09-22": 47,
        "2016-09-21": 67,
        "2016-09-20": 59,
        "2016-09-19": 19,
        "2016-09-18": 108,
        "2016-09-17": 174,
        "2016-09-16": 0,
        "2016-09-15": 52,
        "2016-09-14": 12,
        "2016-09-13": 123
    }
}
```

## Errors

List error stats

```endpoint
GET /stats/errors
```

#### Example Request

```curl
$ curl https://workflow.ds.io/stats/errors -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example success response

```json
[
    {
        "dataset_id": "avaps",
        "count": 3
    },
    {
        "dataset_id": "cpl",
        "count": 3
    },
    {
        "dataset_id": "hamsr",
        "count": 3
    },
    {
        "dataset_id": "hirad",
        "count": 3
    },
    {
        "dataset_id": "hiwrap",
        "count": 3
    },
    {
        "dataset_id": "wwlln",
        "count": 4
    }
]
```
