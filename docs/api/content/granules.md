## List

You can list all granules within a collection using this endpoint

```endpoint
GET /granules/{collection_short_name}
```

#### Example Request

```curl
$ curl https://workflow.ds.io/granules/cpl -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example Success Response

```json
[
    {
        "sourceS3Uris": [
            "s3://cumulus-ghrc-raw/cpl/HS3_CPL_ATB_13215a_20130829.hdf5"
        ],
        "name": "HS3_CPL_ATB_13215a_20130829.hdf5",
        "lastModified": 1398384000,
        "destinationS3Uris": [
            "s3://cumulus-ghrc-archive/hs3cpl/HS3_CPL_ATB_13215a_20130829.hdf5",
            "s3://cumulus-ghrc-archive/hs3cpl/HS3_CPL_ATB_13215a_20130829.nc"
        ],
        "updatedAt": 1474892118,
        "sourceFiles": [
            "ftp://hs3.nsstc.nasa.gov/pub/hs3/CPL/data/2013/hdf/0829/HS3_CPL_ATB_13215a_20130829.hdf5"
        ],
        "createdAt": 1474892118,
        "_index": "cumulus_granules_cpl"
    },
    {
        "sourceS3Uris": [
            "s3://cumulus-ghrc-raw/cpl/HS3_CPL_OP_13216a_20130904.hdf5"
        ],
        "name": "HS3_CPL_OP_13216a_20130904.hdf5",
        "lastModified": 1398384000,
        "destinationS3Uris": [
            "s3://cumulus-ghrc-archive/hs3cpl/HS3_CPL_OP_13216a_20130904.hdf5",
            "s3://cumulus-ghrc-archive/hs3cpl/HS3_CPL_OP_13216a_20130904.nc"
        ],
        "updatedAt": 1474892832,
        "sourceFiles": [
            "ftp://hs3.nsstc.nasa.gov/pub/hs3/CPL/data/2013/hdf/0904/HS3_CPL_OP_13216a_20130904.hdf5"
        ],
        "createdAt": 1474892832,
        "_index": "cumulus_granules_cpl"
    }
]
```

## Retrieve

To retrieve a particular granule use this endpoint

```endpoint
GET /granules/{collection_short_name}/{granule_short_name}
```
#### Example Request

```curl
$ curl https://workflow.ds.io/granules/cpl/HS3_CPL_ATB_13215a_20130829.hdf5 -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example Success Response

```json
{
    "sourceS3Uris": [
        "s3://cumulus-ghrc-raw/cpl/HS3_CPL_ATB_13215a_20130829.hdf5"
    ],
    "name": "HS3_CPL_ATB_13215a_20130829.hdf5",
    "lastModified": 1398384000,
    "destinationS3Uris": [
        "s3://cumulus-ghrc-archive/hs3cpl/HS3_CPL_ATB_13215a_20130829.hdf5",
        "s3://cumulus-ghrc-archive/hs3cpl/HS3_CPL_ATB_13215a_20130829.nc"
    ],
    "updatedAt": 1474892118,
    "sourceFiles": [
        "ftp://hs3.nsstc.nasa.gov/pub/hs3/CPL/data/2013/hdf/0829/HS3_CPL_ATB_13215a_20130829.hdf5"
    ],
    "createdAt": 1474892118,
    "_index": "cumulus_granules_cpl"
}
```
