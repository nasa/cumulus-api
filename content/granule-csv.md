## Get Granule CSV file

Get a CSV file of all the granule in the Cumulus database. 

```endpoint
GET /v1/granule-csv
```

#### Example request

```curl
$ curl https://example.com/v1/granule-csv --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```
|granuleUr                                |collectionId |createdAt               |startDateTime           |endDateTime             |
|MOD11A1.A2017137.h20v17.006.2017138085755|MOD11A1___006|2000-05-28T19:50:20.920Z|2001-01-01T00:00:00.000Z|2001-01-01T00:00:00.100Z|
|MOD11A1.A2017137.h20v17.006.2017138085766|MOD11A1___006|2000-05-28T19:50:20.757Z|2001-01-01T00:00:00.200Z|2001-01-01T00:00:00.300Z|
```
