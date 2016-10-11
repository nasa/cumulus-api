## List

Lists all collections stored on Cumulus.

```endpoint
GET /collections/
```

#### Example Request

```curl
$ curl https://workflow.ds.io/collections -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example success response

```json
[
    {
        "daacName": "Global Hydrology Resource Center DAAC",
        "name": "cpl",
        "destinationDataBucket": {
            "prefix": "hs3cpl/",
            "granulesFiles": 1,
            "bucketName": "cumulus-ghrc-archive",
            "format": ".nc"
        },
        "sourceDataBucket": {
            "prefix": "cpl/",
            "granulesFiles": 1,
            "bucketName": "cumulus-ghrc-raw",
            "format": ".hdf5"
        },
        "dataPipeLine": {
            "batchLimit": 3,
            "recipe": {
                "resource": "group",
                "name": "WorkerGroup",
                "steps": [
                    {
                        "type": "archive",
                        "name": "Fetch",
                        "action": "download"
                    },
                    {
                        "type": "runner",
                        "name": "Process",
                        "image": "985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-cpl:latest",
                        "after": "Fetch"
                    },
                    {
                        "type": "metadata",
                        "name": "Metadata",
                        "after": "Process"
                    },
                    {
                        "type": "archive",
                        "name": "Upload",
                        "action": "upload",
                        "after": "Metadata"
                    },
                    {
                        "type": "cleanup",
                        "after": "Upload"
                    }
                ]
            }
        },
        "versionId": 1,
        "updatedAt": 1475794308179,
        "shortName": "hs3cpl",
        "createdAt": 1475794308179,
        "_index": "cumulus_datasets"
    },
    {
        "daacName": "Global Hydrology Resource Center DAAC",
        "name": "hirad",
        "destinationDataBucket": {
            "prefix": "hs3hirad/",
            "granulesFiles": 1,
            "bucketName": "cumulus-ghrc-archive",
            "format": ".nc"
        },
        "sourceDataBucket": {
            "prefix": "hirad/",
            "granulesFiles": 1,
            "bucketName": "cumulus-ghrc-raw",
            "format": ".nc"
        },
        "dataPipeLine": {
            "batchLimit": 100,
            "recipe": {
                "resource": "group",
                "name": "WorkerGroup",
                "steps": [
                    {
                        "type": "archive",
                        "name": "Fetch",
                        "action": "download"
                    },
                    {
                        "type": "runner",
                        "name": "Process",
                        "image": "985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-hirad:latest",
                        "after": "Fetch"
                    },
                    {
                        "type": "metadata",
                        "name": "Metadata",
                        "after": "Process"
                    },
                    {
                        "type": "archive",
                        "name": "Upload",
                        "action": "upload",
                        "after": "Metadata"
                    },
                    {
                        "type": "cleanup",
                        "after": "Upload"
                    }
                ]
            }
        },
        "versionId": 1,
        "updatedAt": 1475789858373,
        "shortName": "hs3hirad",
        "createdAt": 1475789858373,
        "_index": "cumulus_datasets"
    }
]
```

## Retrieve

To retrieve a particular collection use this endpoint

```endpoint
GET /collections/{short_name}
```

#### Example Request

```curl
$ curl https://workflow.ds.io/collections/cpl -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example success response

```json
{
    "daacName": "Global Hydrology Resource Center DAAC",
    "name": "cpl",
    "destinationDataBucket": {
        "prefix": "hs3cpl/",
        "granulesFiles": 1,
        "bucketName": "cumulus-ghrc-archive",
        "format": ".nc"
    },
    "sourceDataBucket": {
        "prefix": "cpl/",
        "granulesFiles": 1,
        "bucketName": "cumulus-ghrc-raw",
        "format": ".hdf5"
    },
    "dataPipeLine": {
        "batchLimit": 3,
        "recipe": {
            "resource": "group",
            "name": "WorkerGroup",
            "steps": [
                {
                    "type": "archive",
                    "name": "Fetch",
                    "action": "download"
                },
                {
                    "type": "runner",
                    "name": "Process",
                    "image": "985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-cpl:latest",
                    "after": "Fetch"
                },
                {
                    "type": "metadata",
                    "name": "Metadata",
                    "after": "Process"
                },
                {
                    "type": "archive",
                    "name": "Upload",
                    "action": "upload",
                    "after": "Metadata"
                },
                {
                    "type": "cleanup",
                    "after": "Upload"
                }
            ]
        }
    },
    "versionId": 1,
    "updatedAt": 1475794308179,
    "shortName": "hs3cpl",
    "createdAt": 1475794308179,
    "_index": "cumulus_datasets"
}
```

## Add

To add a new collection use this endpoint

```endpoint
POST /collections/
```

```curl
$ curl -X POST https://workflow.ds.io/collections -H 'Content-Type: application/json' -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example request body

```json
{
    "daacName": "Global Hydrology Resource Center DAAC",
    "name": "cpl",
    "destinationDataBucket": {
        "prefix": "hs3cpl/",
        "granulesFiles": 1,
        "bucketName": "cumulus-ghrc-archive",
        "format": ".nc"
    },
    "sourceDataBucket": {
        "prefix": "cpl/",
        "granulesFiles": 1,
        "bucketName": "cumulus-ghrc-raw",
        "format": ".hdf5"
    },
    "dataPipeLine": {
        "batchLimit": 3,
        "recipe": {
            "resource": "group",
            "name": "WorkerGroup",
            "steps": [
                {
                    "type": "archive",
                    "name": "Fetch",
                    "action": "download"
                },
                {
                    "type": "runner",
                    "name": "Process",
                    "image": "985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-cpl:latest",
                    "after": "Fetch"
                },
                {
                    "type": "metadata",
                    "name": "Metadata",
                    "after": "Process"
                },
                {
                    "type": "archive",
                    "name": "Upload",
                    "action": "upload",
                    "after": "Metadata"
                },
                {
                    "type": "cleanup",
                    "after": "Upload"
                }
            ]
        }
    },
    "versionId": 1,
    "updatedAt": 1475794308179,
    "shortName": "hs3cpl",
    "createdAt": 1475794308179,
}
```

#### Example Error Response

```json
{
    "errorMessage": "Record already exists"
}
```

#### Example Success Response

```json
{
	"name": "cpl",
	"shortName": "hs3cpl",
    "daacName": "Global Hydrology Resource Center DAAC",
    "destinationDataBucket": {
        "prefix": "hs3cpl/",
        "granulesFiles": 1,
        "bucketName": "cumulus-ghrc-archive",
        "format": ".nc"
    },
    "sourceDataBucket": {
        "prefix": "cpl/",
        "granulesFiles": 1,
        "bucketName": "cumulus-ghrc-raw",
        "format": ".hdf5"
    },
    "dataPipeLine": {
        "batchLimit": 3,
        "recipe": {
            "resource": "group",
            "name": "WorkerGroup",
            "steps": [
                {
                    "type": "archive",
                    "name": "Fetch",
                    "action": "download"
                },
                {
                    "type": "runner",
                    "name": "Process",
                    "image": "985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-cpl:latest",
                    "after": "Fetch"
                },
                {
                    "type": "metadata",
                    "name": "Metadata",
                    "after": "Process"
                },
                {
                    "type": "archive",
                    "name": "Upload",
                    "action": "upload",
                    "after": "Metadata"
                },
                {
                    "type": "cleanup",
                    "after": "Upload"
                }
            ]
        }
    }
}
```

Property | Description
---|---
`name` | Collection name (string)
`shortName` | Short Name (concept_id) from CMR (string)
`daacName` | Name of the daac (string)
`destinationDataBucket` | Destination S3 bucket configuration (object)
`sourceDataBucket` | Source S3 bucket configuration (object)
`dataPipeLine` | DataPipeline configuration (object)

## Edit

To edit an existing collection use this endpoint. You must include the name of the collection and fields that are being edited. For example if only the DAAC name is edited, just include the `name` and `daacName` fields

```endpoint
PUT /collections/
```

#### Example Request

```curl
$ curl -X PUT https://workflow.ds.io/collections -H 'Content-Type: application/json' -H 'Authorization: tokentakenfromsinginendpoint'
```

#### Example request body

```json
{
    "daacName": "new Global Hydrology Resource Center DAAC",
    "name": "cpl"
}
```

#### Example Success Response

```json
{
	"name": "cpl",
	"shortName": "hs3cpl",
    "daacName": "new Global Hydrology Resource Center DAAC",
    "destinationDataBucket": {
        "prefix": "hs3cpl/",
        "granulesFiles": 1,
        "bucketName": "cumulus-ghrc-archive",
        "format": ".nc"
    },
    "sourceDataBucket": {
        "prefix": "cpl/",
        "granulesFiles": 1,
        "bucketName": "cumulus-ghrc-raw",
        "format": ".hdf5"
    },
    "dataPipeLine": {
        "batchLimit": 3,
        "recipe": {
            "resource": "group",
            "name": "WorkerGroup",
            "steps": [
                {
                    "type": "archive",
                    "name": "Fetch",
                    "action": "download"
                },
                {
                    "type": "runner",
                    "name": "Process",
                    "image": "985962406024.dkr.ecr.us-east-1.amazonaws.com/cumulus-hs3-cpl:latest",
                    "after": "Fetch"
                },
                {
                    "type": "metadata",
                    "name": "Metadata",
                    "after": "Process"
                },
                {
                    "type": "archive",
                    "name": "Upload",
                    "action": "upload",
                    "after": "Metadata"
                },
                {
                    "type": "cleanup",
                    "after": "Upload"
                }
            ]
        }
    }
}
```

Property | Description
---|---
`name` | Collection name (string)
`shortName` | Short Name (concept_id) from CMR (string)
`daacName` | Name of the daac (string)
`destinationDataBucket` | Destination S3 bucket configuration (object)
`sourceDataBucket` | Source S3 bucket configuration (object)
`dataPipeLine` | DataPipeline configuration (object)
