## Get Granule CSV file

Get a CSV file of all the granule in the Cumulus database.

```endpoint
GET /granule-csv
```

#### Example request

```curl
$ curl https://example.com/granule-csv --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

``` json
"granuleUr","collectionId","createdAt","startDateTime","endDateTime","status","updatedAt","published"
"MOD14A1.A9506271.IvEJsu.006.8359924290786","MOD14A1___006","2020-05-18T20:15:54.525Z","2017-10-24T00:00:00Z","2017-11-08T23:59:59Z","completed","2020-05-18T20:16:02.473Z",false
"MYD13Q1.A9663671.0zkwKH.006.9812354158395","MYD13Q1___006","2020-07-06T19:46:19.957Z","2017-10-24T00:00:00Z","2017-11-08T23:59:59Z","completed","2020-07-06T19:46:57.054Z",true
```
