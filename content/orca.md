## List recovery request status

This endpoint lists ORCA recovery request status.

Query must include one or both of the following query parameters:

| query string parameter | description |
| --- | --- |
| `granuleId={granuleId}` | query the recovery requests for a given granuleId |
| `asyncOperationId={asyncOperationId}` | query the recovery requests for a given asyncOperationId |

```endpoint
GET /orca/recovery
```

#### Example request

```curl
$ curl https://example.com/orca/recovery?asyncOperationId=0eb8e809-8790-5409-1239-bcd9e8d28b8e --header 'Authorization: Bearer ReplaceWithTheToken'
```
```curl
$ curl https://example.com/orca/recovery?granuleId=123456 --header 'Authorization: Bearer ReplaceWithTheToken'
```

#### Example response

```json
[
  {
    "request_id": "832f322f-c64c-4f47-8a74-7f3a5ffc5bd1",
    "request_group_id": "1b48171d-7b07-4fb0-8c15-fbac7d7da5c6",
    "granule_id": "MYD13Q1.A0319630.zMiLs8.006.2186263431231",
    "object_key": "MYD13Q1___006/MYD/MYD13Q1.A0319630.zMiLs8.006.2186263431231.cmr.xml",
    "job_type": "restore",
    "restore_bucket_dest": "bucket-orca-glacier",
    "archive_bucket_dest": "bucket-protected",
    "job_status": "complete",
    "request_time": "2021-02-24 21:43:56.210106+00:00",
    "last_update_time": "2021-02-24 21:43:56.210106+00:00",
    "err_msg": null
  },
  {
    "request_id": "0f8514cf-c8fb-403d-8dbb-071b31787489",
    "request_group_id": "1b48171d-7b07-4fb0-8c15-fbac7d7da5c6",
    "granule_id": "MYD13Q1.A0319630.zMiLs8.006.2186263431231",
    "object_key": "MYD13Q1___006/MYD/MYD13Q1.A0319630.zMiLs8.006.2186263431231.hdf.met",
    "job_type": "restore",
    "restore_bucket_dest": "bucket-orca-glacier",
    "archive_bucket_dest": "bucket-private",
    "job_status": "inprogress",
    "request_time": "2021-02-24 21:43:54.006079+00:00",
    "last_update_time": "2021-02-24 21:43:54.006079+00:00",
    "err_msg": null
  },
  {
    "request_id": "615cdcd4-8fcd-4c59-882e-700cb3ab7772",
    "request_group_id": "1b48171d-7b07-4fb0-8c15-fbac7d7da5c6",
    "granule_id": "MYD13Q1.A0319630.zMiLs8.006.2186263431231",
    "object_key": "MYD13Q1___006/2017/MYD/MYD13Q1.A0319630.zMiLs8.006.2186263431231.hdf",
    "job_type": "restore",
    "restore_bucket_dest": "bucket-orca-glacier",
    "archive_bucket_dest": "bucket-protected",
    "job_status": "inprogress",
    "request_time": "2021-02-24 21:43:53.120706+00:00",
    "last_update_time": "2021-02-24 21:43:53.120706+00:00",
    "err_msg": null
  }
]
```
