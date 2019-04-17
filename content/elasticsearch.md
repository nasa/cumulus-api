## Elasticsearch

These endpoints provide an interface into the Elasticsearch SDK to perform functions like Elasticsearch reindex.

Cumulus uses [index aliases](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-aliases.html) to allow reindexing with no downtime.

## Reindex

The reindex command creates a new index and reindexes the source index to the new, destination index. This uses the [Elasticsearch reindex functionality](https://www.elastic.co/guide/en/elasticsearch/reference/5.5/docs-reindex.html), but includes setting up the new index.

Note that there will now be two copies of your index. Your Cumulus instance will still point to the old copy until you perform the `change-reindex` function described below.

An alias should not be specified unless you have a specific alias configured. If a source index is not specified, it will default to the index from the alias. If you want to name the destination index something particular, you can specify a name, otherwise the destination index name will default to 'cumulus-year-month-day' with today's date (e.g. `cumulus-4-12-2019`). If you specify a destination index name, it must be an index that does not already exist in your cluster.

Since reindex can be a long running operation, the `reindex-status` endpoint must be queried to see if the operation has completed.

#### Example requests

```curl
$ curl --request POST https://example.com/v1/elasticsearch/reindex --header 'Authorization: Bearer ReplaceWithTheToken'
```

```curl
$ curl --request POST https://example.com/v1/elasticsearch/reindex --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
  "aliasName": "cumulus-alias",
  "sourceIndex": "cumulus-4-4-2019",
  "destIndex": "cumulus-new-index"
}'
```

#### Example response

```json
{ "message": "Reindexing from cumulus-4-4-2019 to cumulus-4-12-2019. Check the reindex-status endpoint for status.}
```

## Reindex Status

Reindexing can be a long running operation, so use this endpoint to get the status of your reindex and the status of your indices.

`reindexStatus.nodes` will be populated if there is a reindex operation currently running, `nodes` will be empty if not.

The `elasticsearchStatus` shows the number of documents in each index which can be used as a sanity check for the reindex operation before switching over to the new index. Note that the active index will continue to index logs, so the number of documents in the active index will be slightly higher and continue to grow.

#### Example request

```curl
$ curl https://example.com/v1/elasticsearch/reindex-status --header 'Authorization: Bearer ReplaceWithTheToken'
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

Change index switches Cumulus to point to the new index, rather than the current index. You may choose to delete your current index during this operation using the `deleteSource` parameter, which defaults to `false`.

`currentIndex` and `newIndex` are required parameters.

In the context of reindex, you'd call `change-index`, following reindex completion to start using the new index with no downtime.

#### Example request

```curl
$ curl --request POST https://example.com/v1/elasticsearch/change-index --header 'Authorization: Bearer ReplaceWithTheToken' --data '{
  "aliasName": "cumulus-alias",
  "currentIndex": "cumulus-4-4-2019",
  "newIndex": "cumulus-4-16-2019",
  "deleteSource": false
}'
```

#### Example response

```json
{ "message": "Reindex success - alias cumulus now pointing to cumulus-4-4-2019" }
```
