## Elasticsearch

These endpoints provide an interface into the Elasticsearch SDK to perform functions like Elasticsearch reindex.

Cumulus uses [index aliases](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-aliases.html) to allow reindexing with no downtime.

## Reindex

The reindex command creates a new index and reindexes the source index to the new, destination index. This uses the [Elasticsearch reindex functionality](https://www.elastic.co/guide/en/elasticsearch/reference/5.3/docs-reindex.html), but includes setting up the new index.

Note that there will now be two copies of your index. Your Cumulus instance will still point to the old copy until you perform the `change-index` function described below.

An alias should not be specified unless you have a specific alias configured. If a source index is not specified, it will default to the index from the alias. If you want to name the destination index something particular, you can specify a name, otherwise the destination index name will default to 'cumulus-year-month-day' with today's date (e.g. `cumulus-4-12-2019`). If you specify a destination index name, it must be an index that does not already exist in your cluster.  The destination index must be different than the source index or the operation will fail.

Since reindex can be a long running operation, the `reindex-status` endpoint must be queried to see if the operation has completed.

Overview of request fields:

| parameter | value | required | description |
| ----- | --- | -- | ----------- |
| `aliasName` | `string` | `false` | Alias to reindex from. Will be used if `sourceIndex` is not provided. Will default to the default alias if not provided. |
| `sourceIndex` | `string `| `false` | Index to reindex from |
| `destIndex` | `string` | `true` | Index to reindex to |

#### Example request

```curl
$ curl --request POST https://example.com/elasticsearch/reindex --header 'Authorization: Bearer ReplaceWithTheToken'
```


#### Example response

```json
{ "message": "Reindexing from cumulus-4-4-2019 to cumulus-4-12-2019. Check the reindex-status endpoint for status." }
```

#### Example request

```curl
$ curl --request POST https://example.com/elasticsearch/reindex --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{
  "aliasName": "cumulus-alias",
  "sourceIndex": "cumulus-4-4-2019",
  "destIndex": "cumulus-new-index"
}'
```

#### Example response

```json
{ "message": "Reindexing from cumulus-4-4-2019 to cumulus-new-index. Check the reindex-status endpoint for status." }
```

## Reindex Status

Reindexing can be a long running operation, so use this endpoint to get the status of your reindex and the status of your indices.

`reindexStatus.nodes` will be populated if there is a reindex operation currently running, `nodes` will be empty if not.

The `elasticsearchStatus` shows the number of documents in each index which can be used as a sanity check for the reindex operation before switching over to the new index. Note that the active index will continue to index logs, so the number of documents in the active index will be slightly higher and continue to grow.

#### Example request

```curl
$ curl https://example.com/elasticsearch/reindex-status --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example responses

```json
{
    "reindexStatus": {
        "nodes": {
            "TKDzeZ_TQVWkwKZYtCtv_g": {
                "name": "TKDzeZ_",
                "roles": [
                    "master",
                    "data",
                    "ingest"
                ],
                "tasks": {
                    "TKDzeZ_TQVWkwKZYtCtv_g:546691": {
                        "node": "TKDzeZ_TQVWkwKZYtCtv_g",
                        "id": 546691,
                        "type": "transport",
                        "action": "indices:data/write/reindex",
                        "start_time_in_millis": 1555073365557,
                        "running_time_in_nanos": 75424890,
                        "cancellable": true
                    }
                }
            }
        }
    },
    "indexStatus": {
        "_shards": {
            "total": 32,
            "successful": 16,
            "failed": 0
        },
        "_all": {
            "primaries": {
                "docs": {
                    "count": 52213,
                    "deleted": 0
                }
            },
            "total": {
                "docs": {
                    "count": 52213,
                    "deleted": 0
                }
            }
        },
        "indices": {
            ".kibana": {
                "primaries": {
                    "docs": {
                        "count": 1,
                        "deleted": 0
                    }
                },
                "total": {
                    "docs": {
                        "count": 1,
                        "deleted": 0
                    }
                }
            },
            "cumulus-2019-4-12": {
                "primaries": {
                    "docs": {
                        "count": 25569,
                        "deleted": 0
                    }
                },
                "total": {
                    "docs": {
                        "count": 25569,
                        "deleted": 0
                    }
                }
            },
            "cumulus-2019-4-9": {
                "primaries": {
                    "docs": {
                        "count": 25644,
                        "deleted": 0
                    }
                },
                "total": {
                    "docs": {
                        "count": 25644,
                        "deleted": 0
                    }
                }
            }
        }
    }
}
```

```json
{
    "reindexStatus": {
        "nodes": {}
    },
    "indexStatus": {
        "_shards": {
            "total": 22,
            "successful": 11,
            "failed": 0
        },
        "_all": {
            "primaries": {
                "docs": {
                    "count": 51210,
                    "deleted": 0
                }
            },
            "total": {
                "docs": {
                    "count": 51210,
                    "deleted": 0
                }
            }
        },
        "indices": {
            ".kibana": {
                "primaries": {
                    "docs": {
                        "count": 1,
                        "deleted": 0
                    }
                },
                "total": {
                    "docs": {
                        "count": 1,
                        "deleted": 0
                    }
                }
            },
            "cumulus-2019-4-12": {
                "primaries": {
                    "docs": {
                        "count": 25569,
                        "deleted": 0
                    }
                },
                "total": {
                    "docs": {
                        "count": 25569,
                        "deleted": 0
                    }
                }
            },
            "cumulus-2019-4-9": {
                "primaries": {
                    "docs": {
                        "count": 25640,
                        "deleted": 0
                    }
                },
                "total": {
                    "docs": {
                        "count": 25640,
                        "deleted": 0
                    }
                }
            }
        }
    }
}
```

## Change Index

Change index switches the Elasticsearch index to point to the new index, rather than the current index. You may choose to delete your current index during this operation using the `deleteSource` parameter, which defaults to `false`. If you are using the default index created by Cumulus, this will switch your Cumulus instance to the new index and you will see those changes immediately via the API and dashboard. If `newIndex` does not exist, an index with that name will be created.

`currentIndex` and `newIndex` are required parameters.

In the context of reindex, you'd call `change-index`, following reindex completion to start using the new index with no downtime.

Overview of the request fields:

| parameter | value | required | description |
| ----- | --- | -- | ----------- |
| `aliasName` | `string` | `false` | Alias to use for `newIndex`. Will be the default index if not provided |
| `currentIndex` | `string `| `true` | Index to change the alias from |
| `newIndex` | `string` | `true` | Index to change alias to |
| `deleteSource` | `boolean` | `false` | If set to `true` it will delete the index provided in `currentIndex` |

#### Example request

```curl
$ curl --request POST https://example.com/elasticsearch/change-index --header 'Content-Type: application/json' --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
  "aliasName": "cumulus-alias",
  "currentIndex": "cumulus-12-4-2019",
  "newIndex": "cumulus-4-12-2019",
  "deleteSource": false
}'
```

#### Example response

```json
{ "message": "Reindex success - alias cumulus now pointing to cumulus-4-12-2019" }
```

## Index from Database

In case of corruption of your Elasticsearch index, you can reindex your data from the database. This will include collections, executions, granules, pdrs, providers, and rules. Logs will not be indexed since they are not stored in the database.

You can specify an index (should be empty) or if no index name is specified, a default with the format of 'cumulus-year-month-day' with today's date (e.g. `cumulus-4-12-2019`) will be used. If the specified index does not exist, it will be created.

You may optionally specify the following request fields:

| parameter | value | required | description |
| ----- | --- | -- | ----------- |
| `postgresResultPageSize` | `number` | `false` | Number of records to pull per database query for index to Elasticsearch   Defaults 1000 |
| `postgresConnectionPoolSize` | `number `| `false` | Max number of connections to postgres database to allocate.   Defaults to 10|
| `esRequestConcurrency` | `number` | `false` | Maximum concurrency of writes to Elasticsearch Defaults to 10|
| `indexName` | `string` | `false` | Name of index to re-index to.   Defaults to `cumulus-dd-mm-yyyy` |




It is recommended that workflow rules be turned off, as any data ingested into the database during this operation cannot be guaranteed to make it into the new index. Following the completion of the index, you will need to use the change index operation to switch your Elasticsearch to point to the new instance.

Indexing is an async operation, so an operation id will be returned. You can query the status using the `asyncoperations` GET endpoint with the operation id.

#### Example request

```curl
$ curl --request POST https://example.com/elasticsearch/index-from-database --header 'Authorization: Bearer ReplaceWithTheToken' --header 'Content-Type: application/json' --data '{
  "indexName": "recovery-index"
}'
```

#### Example response

```json
{"message":"Indexing database to recovery-index. Operation id: 8f4d35ba-c858-40ae-93f0-4465f54a911d"}
```

#### Example request - operation status

```curl
$ curl --header 'Authorization: Bearer ReplaceWithTheToken' https://example.com/asyncoperations/8f4d35ba-c858-40ae-93f0-4465f54a911d
```

#### Example response - operation status

```json
{
   "id":"8f4d35ba-c858-40ae-93f0-4465f54a911d",
   "status":"SUCCEEDED",
   "taskArn":"arn:aws:ecs:us-east-1:XXXXXXXXXXXX:task/dc41ff2b-e610-4f7a-8c63-48b48ceb7160",
   "output":"\"Index from database complete\""
}
```

## Indices Status

Use the indices-status endpoint to view information about your elasticsearch indices. This endpoint will return the information for the [indices call](https://www.elastic.co/guide/en/elasticsearch/reference/7.x/cat-indices.html) in the Elasticsearch API.

#### Example request

```curl
$ curl  https://example.com/elasticsearch/indices-status --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
yellow open .kibana           yxBUTswHSr2ecec8y1szEg 1 1      1   0   3.1kb   3.1kb
yellow open cumulus-2019-6-21 ELpdxYVKSc-VvNxlNjmMUA 5 1    700 225   2.5mb   2.5mb
yellow open cumulus-2019-6-24 lmylLkTsQJWIVYFJcftMqQ 5 1    700   0     4mb     4mb
yellow open cumulus           jQLXsb8yS4aEmLAAyHcmCw 5 1 217298 588 124.3mb 124.3mb
```

## Current Index

Get the current aliased index being used by the Cumulus Elasticsearch instance.

#### Example request

```curl
$ curl  https://example.com/elasticsearch/current-index --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
["cumulus-2019-6-24"]
```
